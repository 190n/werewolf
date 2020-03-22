import WebSocket from 'ws';
import { Commands } from 'redis';

import { assignCards, getInitialRevealedInformation } from './game';

interface EndMessage {
    type: 'end';
    reason: string;
}

interface AssignIdMessage {
    type: 'id';
    id: string;
}

interface PlayerListMessage {
    type: 'players';
    players: Array<{
        nick?: string;
        id: string;
        isLeader: boolean;
    }>;
}

const openSockets = new Map<string, Map<string, WebSocket>>();

export default function createHandler(redisCall: <T>(command: keyof Commands<boolean>, ...args: any[]) => Promise<T>) {
    async function sendPlayerList(ws: WebSocket, gameId: string) {
        const allPlayerIds = await redisCall<string[]>('smembers', `games:${gameId}:players`),
            nicks = await redisCall<{ [id: string]: string | undefined } | null>('hgetall', `games:${gameId}:nicks`),
            leaderId = await redisCall<string>('hget', 'gameKeys', gameId),
            players = allPlayerIds.map(id => ({
                id,
                nick: nicks?.[id],
                isLeader: id == leaderId,
            }));

        ws.send(JSON.stringify({
            type: 'players',
            players,
        }));
    }

    async function broadcast(gameId: string, message: object, inGameOnly: boolean = true): Promise<void> {
        if (!openSockets.has(gameId)) return;
        const sockets = openSockets.get(gameId) as Map<string, WebSocket>;
        if (inGameOnly) {
            const playersInGame = await redisCall<string[]>('smembers', `games:${gameId}:playersInGame`);
            for (const id of playersInGame) {
                const ws = sockets.get(id);
                if (ws) {
                    ws.send(JSON.stringify(message));
                }
            }
        } else {
            for (const ws of sockets.values()) {
                ws.send(JSON.stringify(message));
            }
        }
    }

    async function broadcastPlayerList(gameId: string): Promise<void> {
        if (!openSockets.has(gameId)) return;
        await Promise.all([...(openSockets.get(gameId) as Map<string, WebSocket>).values()].map(
            ws => sendPlayerList(ws, gameId)
        ));
    }

    function killConnection(ws: WebSocket, reason: string) {
        ws.send(JSON.stringify({
            type: 'end',
            reason,
        }));
        ws.close();
    }

    function storeSocket(gameId: string, playerId: string, ws: WebSocket): boolean {
        if (!openSockets.has(gameId)) {
            openSockets.set(gameId, new Map());
        } else if (openSockets.get(gameId)?.has(playerId)) {
            ws.send(JSON.stringify({
                type: 'end',
                reason: 'You are already connected. Make sure you don\'t have this game open in any other tab.'
            }));
            ws.close();
            return false;
        }
        (openSockets.get(gameId) as Map<string, WebSocket>).set(playerId, ws);

        // also attach handlers in here
        ws.on('message', (data: string) => {
            handleIncomingMessage(gameId, playerId, ws, data);
        });
        ws.on('close', async () => {
            // remove from stored sockets
            (openSockets.get(gameId) as Map<string, WebSocket>).delete(playerId);
            // remove from redis
            await redisCall('srem', `games:${gameId}:connected`, playerId);
            // if leader...do something
            console.log(`lost connection to game ${gameId} from player ${playerId}`);
        });
        return true;
    }

    async function isLeader(gameId: string, playerId: string): Promise<boolean> {
        return await redisCall<string | undefined>('hget', 'gameKeys', gameId) == playerId;
    }

    async function handleIncomingMessage(gameId: string, playerId: string, ws: WebSocket, data: string) {
        try {
            const message = JSON.parse(data);

            if (typeof message == 'object') {
                if (message.type == 'nick') {
                    if (!message.hasOwnProperty('nick')) {
                        killConnection(ws, 'Malformed message.');
                    } else {
                        const nicksInUse = await redisCall<string[]>('hvals', `games:${gameId}:nicks`);
                        if (nicksInUse.includes(message.nick) && message.nick != await redisCall<string>('hget', `games:${gameId}:nicks`, playerId)) {
                            ws.send(JSON.stringify({
                                type: 'nickReject',
                                reason: 'That nickname is already being used.'
                            }));
                        } else {
                            await redisCall<number>('hset', `games:${gameId}:nicks`, playerId, message.nick);
                            ws.send(JSON.stringify({
                                type: 'nickAccept',
                            }));
                            await broadcastPlayerList(gameId);
                        }
                    }
                } else if (message.type == 'toCardSelection' && message.players instanceof Array && await isLeader(gameId, playerId)) {
                    await redisCall<number>('sadd', `games:${gameId}:playersInGame`, ...message.players);
                    await redisCall<number>('set', `games:${gameId}:stage`, 'cardSelection');
                    broadcast(gameId, {
                        type: 'stage',
                        stage: 'cardSelection',
                    }, false);
                    broadcast(gameId, {
                        type: 'playersInGame',
                        players: message.players,
                    }, false);
                } else if (message.type == 'cardsInPlay' && message.cardsInPlay instanceof Array && await isLeader(gameId, playerId)) {
                    broadcast(gameId, {
                        type: 'cardsInPlay',
                        cardsInPlay: message.cardsInPlay,
                    });
                } else if (
                    message.type == 'confirmCards'
                        && message.cardsInPlay instanceof Array
                        && await isLeader(gameId, playerId)
                        && message.cardsInPlay.length == await redisCall<number>('scard', `games:${gameId}:playersInGame`) + 3
                ) {
                    await redisCall<number>('lpush', `games:${gameId}:cardsInPlay`, ...message.cardsInPlay);
                    await redisCall<number>('set', `games:${gameId}:stage`, 'viewCard');

                    broadcast(gameId, {
                        type: 'cardsInPlay',
                        cardsInPlay: message.cardsInPlay,
                    });
                    broadcast(gameId, {
                        type: 'stage',
                        stage: 'viewCard',
                    });

                    await assignCards(
                        await redisCall<string[]>('smembers', `games:${gameId}:playersInGame`),
                        message.cardsInPlay,
                        async (playerId: string, card: string) => {
                            await redisCall<number>('hset', `games:${gameId}:assignedCards`, playerId, card);
                            const playerSocket = (openSockets.get(gameId) as Map<string, WebSocket>).get(playerId);
                            if (playerSocket) {
                                playerSocket.send(JSON.stringify({
                                    type: 'yourCard',
                                    card,
                                }));
                            }
                        },
                        async (cards: string[]) => {
                            await redisCall<number>('lpush', `games:${gameId}:center`, ...cards);
                        },
                    );
                } else if (message.type == 'confirmOwnCard' && await redisCall<number>('sismember', `games:${gameId}:playersInGame`, playerId)) {
                    await redisCall<number>('sadd', `games:${gameId}:haveConfirmed`, playerId);
                    // TODO: probably need to tell player whether they have confirmed, so reloading
                    // will preserve their confirmation

                    if (await redisCall<number>('scard', `games:${gameId}:haveConfirmed`) >= await redisCall<number>('scard', `games:${gameId}:playersInGame`)) {
                        // time for actions

                        await redisCall<number>('set', `games:${gameId}:stage`, 'turns');
                        const sockets = openSockets.get(gameId) as Map<string, WebSocket>;

                        for (const playerId of await redisCall<string[]>('smembers', `games:${gameId}:playersInGame`)) {
                            if (sockets.has(playerId)) {
                                const sock = sockets.get(playerId) as WebSocket;

                                if (await redisCall<string>('hget', `games:${gameId}:assignedCards`, playerId) == 'insomniac') {
                                    sock.send(JSON.stringify({
                                        type: 'stage',
                                        stage: 'wait',
                                    }));
                                } else {
                                    sock.send(JSON.stringify({
                                        type: 'stage',
                                        stage: 'action',
                                    }));

                                    sock.send(JSON.stringify({
                                        type: 'initialRevealedInformation',
                                        info: getInitialRevealedInformation(
                                            playerId,
                                            await redisCall<{ [id: string]: string }>('hgetall', `games:${gameId}:assignedCards`),
                                        ),
                                    }));
                                }
                            }
                        }
                    }
                } else {
                    killConnection(ws, 'Malformed message.');
                }


            } else {
                killConnection(ws, 'Malformed message.');
            }
        } catch (e) {
            console.log(e);
            killConnection(ws, 'Malformed message.');
        }
    }

    async function handleConnection(ws: WebSocket, gameId: string, playerId: string) {
        // There's also a case to handle where a player rejoins the game. Probably another
        // querystring param, so new code in server.ts. actually not!!
        if (await redisCall<number>('sismember', `games:${gameId}:players`, playerId)) {
            // leader or player
            // keep ws around
            if (!storeSocket(gameId, playerId, ws)) return;
            // put them in the game
            await redisCall<number>('sadd', `games:${gameId}:connected`, playerId);
            // send list of players
            await broadcastPlayerList(gameId);

            const stage = await redisCall<string>('get', `games:${gameId}:stage`);

            if (stage != 'lobby') {
                if (await redisCall<number>('sismember', `games:${gameId}:playersInGame`, playerId)) {
                    if (stage != 'turns') {
                        ws.send(JSON.stringify({
                            type: 'stage',
                            stage,
                        }));
                    } else {
                        //            |<--      not implemented       -->|
                        // (insomniac AND waiting for card-moving actions) OR (has done their action)
                        if (
                            await redisCall<string>('hget', `games:${gameId}:assignedCards`, playerId) == 'insomniac'
                            || await redisCall<number>('hexists', `games:${gameId}:actions`, playerId)
                        ) {
                            ws.send(JSON.stringify({
                                type: 'stage',
                                stage: 'wait',
                            }));
                        } else {
                            ws.send(JSON.stringify({
                                type: 'stage',
                                stage: 'action',
                            }));

                            ws.send(JSON.stringify({
                                type: 'initialRevealedInformation',
                                info: getInitialRevealedInformation(
                                    playerId,
                                    await redisCall<{ [id: string]: string }>('hgetall', `games:${gameId}:assignedCards`),
                                ),
                            }));
                        }
                    }

                    ws.send(JSON.stringify({
                        type: 'playersInGame',
                        players: await redisCall<string[]>('smembers', `games:${gameId}:playersInGame`),
                    }));

                    if (stage != 'cardSelection') {
                        ws.send(JSON.stringify({
                            type: 'cardsInPlay',
                            cardsInPlay: await redisCall<string[]>(
                                'lrange',
                                `games:${gameId}:cardsInPlay`,
                                0,
                                await redisCall<number>('llen', `games:${gameId}:cardsInPlay`)),
                        }));

                        ws.send(JSON.stringify({
                            type: 'yourCard',
                            card: await redisCall<string>('hget', `games:${gameId}:assignedCards`, playerId),
                        }));
                    }
                } else {
                    ws.send(JSON.stringify({
                        type: 'stage',
                        stage: 'lobby',
                    }));
                }
            } else {
                ws.send(JSON.stringify({
                    type: 'stage',
                    stage: 'lobby',
                }));
            }
        } else {
            // no game exists, or player id is wrong
            killConnection(ws, 'Game ID and player ID do not match. Make sure you typed the join code correctly.');
        }
    }

    return handleConnection;
}
