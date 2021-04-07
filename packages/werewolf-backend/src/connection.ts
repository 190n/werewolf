import WebSocket from 'ws';
import { Commands } from 'redis';

import {
    assignCards,
    getInitialRevelation,
    performAction,
    canTakeAction,
    Swap,
    isTurnImmediatelyComplete,
    getResults,
    mayWait,
} from './game';

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

    async function broadcast(gameId: string, message: object, inGameOnly: boolean): Promise<void> {
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
            const gameSockets = openSockets.get(gameId);
            if (gameSockets !== undefined) {
                gameSockets.delete(playerId);
            }
            // remove from redis
            await redisCall('srem', `games:${gameId}:connected`, playerId);
            // if leader...do something
            console.log(`lost connection to game ${gameId} from player ${playerId}`);

            if (
                await redisCall<number>('scard', `games:${gameId}:connected`) == 0
                && await redisCall<number>('hexists', 'gameKeys', gameId)
            ) {
                // keep game around for ten minutes
                console.log(`starting expiration timer on game ${gameId}`);
                await redisCall('hset', 'expirationTimes', gameId, Math.floor(Date.now() / 1000 + 600).toString());
            }
        });
        return true;
    }

    async function isLeader(gameId: string, playerId: string): Promise<boolean> {
        return await redisCall<string | undefined>('hget', 'gameKeys', gameId) == playerId;
    }

    async function getAssignedCards(gameId: string): Promise<{ [id: string]: string }> {
        return await redisCall<{ [id: string]: string }>('hgetall', `games:${gameId}:assignedCards`);
    }

    async function getCenter(gameId: string): Promise<[string, string, string]> {
        return await redisCall<[string, string, string]>('lrange', `games:${gameId}:center`, 0, 2);
    }

    async function getEvents(gameId: string, filterPlayerId?: string, filterType?: 'r' | 'a'): Promise<string[]> {
        const events = await redisCall<string[]>(
            'lrange',
            `games:${gameId}:events`,
            0,
            await redisCall<number>('llen', `games:${gameId}:events`) - 1
        );

        if (filterPlayerId !== undefined) {
            const split = events.map(e => e.split(':'));

            if (filterType === undefined) {
                return events.filter((e, i) => split[i][1] == filterPlayerId);
            } else {
                return events.filter((e, i) => split[i][1] == filterPlayerId && split[i][0] == filterType);
            }
        } else {
            return events;
        }
    }

    async function getSwaps(gameId: string): Promise<Swap[]> {
        const swaps = await redisCall<string[]>(
            'lrange',
            `games:${gameId}:swaps`,
            0,
            await redisCall<number>('llen', `games:${gameId}:swaps`) - 1
        );

        return swaps.map(s => {
            const [playerId, c1, c2, order] = s.split(':');

            let card1: string | number = c1,
                card2: string | number = c2;

            if (c1.length == 1) {
                card1 = parseInt(c1);
            }

            if (c2.length == 1) {
                card2 = parseInt(c2);
            }

            return [playerId, card1, card2, parseInt(order)];
        });
    }

    async function runChecksInBackground(): Promise<void> {
        const endTimes = await redisCall<{ [gameId: string]: string }>('hgetall', 'discussionEndTimes'),
            expirationTimes = await redisCall<{ [gameId: string]: string }>('hgetall', 'expirationTimes'),
            forcedWaits = await redisCall<{ [gameAndPlayer: string]: string }>('hgetall', 'forcedWaits');

        if (endTimes) {
            for (const [gameId, endTime] of Object.entries(endTimes)) {
                if (Date.now() / 1000 >= parseInt(endTime)) {
                    console.log(`ending discussion for game ${gameId}`);
                    await redisCall('hdel', 'discussionEndTimes', gameId);
                    await endDiscussion(gameId);
                }
            }
        }

        if (expirationTimes) {
            for (const [gameId, expirationTime] of Object.entries(expirationTimes)) {
                if (Date.now() / 1000 >= parseInt(expirationTime)) {
                    console.log(`destroying game ${gameId}`);
                    await redisCall('hdel', 'expirationTimes', gameId);
                    await destroyGame(gameId);
                }
            }
        }

        if (forcedWaits) {
            for (const [gameAndPlayer, time] of Object.entries(forcedWaits)) {
                if (Date.now() / 1000 >= parseInt(time)) {
                    const [gameId, playerId] = gameAndPlayer.split(':');
                    console.log(`ending wait for player ${playerId} in game ${gameId}`);
                    await redisCall('hdel', 'forcedWaits', gameAndPlayer);
                    await endForcedWait(gameId, playerId);
                }
            }
        }

        setTimeout(runChecksInBackground, 1000);
    }

    async function endDiscussion(gameId: string) {
        await redisCall('set', `games:${gameId}:stage`, 'voting');
        await broadcast(gameId, {
            type: 'stage',
            stage: 'voting',
        }, true);
    }

    async function destroyGame(gameId: string) {
        // gameKeys signals to ws close handler that it shouldn't expire the game
        await redisCall('hdel', 'gameKeys', gameId);

        // check for anyone connected and kill their connections
        const connections = openSockets.get(gameId);
        if (connections !== undefined) {
            for (const ws of connections.values()) {
                killConnection(ws, 'That game has ended.');
            }
        }

        openSockets.delete(gameId);

        // delete everything else in redis
        await redisCall('hdel', 'discussionEndTimes', gameId);
        await redisCall('hdel', 'expirationTimes', gameId);
        await redisCall('del', ...[
            'players',
            'connected',
            'nicks',
            'playersInGame',
            'stage',
            'cardsInPlay',
            'assignedCards',
            'center',
            'haveConfirmed',
            'events',
            'completedTurns',
            'swaps',
            'waiting',
            'config:discussionLength',
            'votes',
            'results',
       ].map(k => `games:${gameId}:${k}`));

       for (const key of await redisCall<string[]>('hkeys', 'forcedWaits')) {
           if (key.startsWith(gameId)) {
               await redisCall('hdel', 'forcedWaits', key);
           }
       }
    }

    async function endForcedWait(gameId: string, playerId: string): Promise<void> {
        if (canTakeAction(playerId, await getAssignedCards(gameId), await redisCall<string[]>('smembers', `games:${gameId}:completedTurns`))) {
            await redisCall('srem', `games:${gameId}:waiting`, playerId);
            await askPlayerForAction(gameId, playerId);
        }
    }

    async function askPlayerForAction(gameId: string, playerId: string): Promise<void> {
        const sock = openSockets.get(gameId)?.get(playerId);
        sock?.send(JSON.stringify({
            type: 'stage',
            stage: 'action',
        }));

        const revelation = getInitialRevelation(playerId, await getAssignedCards(gameId), await getSwaps(gameId));
        if (revelation !== undefined) {
            console.log(`storing revelation "${revelation}" for player ${playerId} in game ${gameId}`);

            await redisCall<number>('rpush', `games:${gameId}:events`, `r:${playerId}:${revelation}`);
            sock?.send(JSON.stringify({
                type: 'revelation',
                revelation,
            }));
        }
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
                    }, true);
                } else if (
                    message.type == 'confirmCards'
                        && message.cardsInPlay instanceof Array
                        && typeof message.discussionLength == 'number'
                        && await isLeader(gameId, playerId)
                        && message.cardsInPlay.length == await redisCall<number>('scard', `games:${gameId}:playersInGame`) + 3
                ) {
                    await redisCall('lpush', `games:${gameId}:cardsInPlay`, ...message.cardsInPlay);
                    await redisCall('set', `games:${gameId}:stage`, 'viewCard');
                    await redisCall('set', `games:${gameId}:config:discussionLength`, message.discussionLength.toString());

                    broadcast(gameId, {
                        type: 'cardsInPlay',
                        cardsInPlay: message.cardsInPlay,
                    }, true);
                    broadcast(gameId, {
                        type: 'stage',
                        stage: 'viewCard',
                    }, true);

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

                    // send list of players that have not confirmed yet
                    const haveNotConfirmed = await redisCall<string[]>('sdiff', `games:${gameId}:playersInGame`, `games:${gameId}:haveConfirmed`);
                    await broadcast(gameId, { type: 'waitingOn', waitingOn: haveNotConfirmed }, true);

                    if (await redisCall<number>('scard', `games:${gameId}:haveConfirmed`) >= await redisCall<number>('scard', `games:${gameId}:playersInGame`)) {
                        // time for actions

                        await redisCall<number>('set', `games:${gameId}:stage`, 'turns');
                        const sockets = openSockets.get(gameId) as Map<string, WebSocket>;

                        for (const p of await redisCall<string[]>('smembers', `games:${gameId}:playersInGame`)) {
                            const sock = sockets.get(p),
                                card = await redisCall<string>('hget', `games:${gameId}:assignedCards`, p);

                            if (isTurnImmediatelyComplete(card)) {
                                await redisCall('sadd', `games:${gameId}:completedTurns`, p);
                                sock?.send(JSON.stringify({
                                    type: 'stage',
                                    stage: 'wait',
                                }));
                            } else if (mayWait(card)) {
                                // they must wait at least fifteen seconds so they can't learn about
                                // which cards players have
                                sock?.send(JSON.stringify({
                                    type: 'stage',
                                    stage: 'wait',
                                }));

                                // wait between 7 and 15 seconds
                                const waitTime = Math.floor(Math.random() * 9 + 7);
                                await redisCall('hset', 'forcedWaits', `${gameId}:${p}`, Math.floor(Date.now() / 1000 + waitTime).toString());
                                await redisCall('sadd', `games:${gameId}:waiting`, p);
                            } else {
                                if (canTakeAction(p, await getAssignedCards(gameId), [])) {
                                    await askPlayerForAction(gameId, p);
                                } else {
                                    await redisCall<number>('sadd', `games:${gameId}:waiting`, p);

                                    sock?.send(JSON.stringify({
                                        type: 'stage',
                                        stage: 'wait',
                                    }));
                                }
                            }
                        }
                    }
                } else if (
                    message.type == 'action'
                    && await redisCall<number>('sismember', `games:${gameId}:playersInGame`, playerId)
                    && !(await redisCall<number>('sismember', `games:${gameId}:completedTurns`, playerId))
                ) {
                    const action: string = message.action;
                    const [result, swaps] = performAction(
                        playerId,
                        await getAssignedCards(gameId),
                        await getCenter(gameId),
                        action,
                        (await getEvents(gameId, playerId, 'a')).map(e => e.split(':')[2]),
                    );

                    if (result !== false) {
                        // legal action

                        if (swaps.length > 0) {
                            // store any resulting swaps
                            // we use lpush because it's faster than rpush, and order doesn't matter
                            // (each swap stores when it should be executed)
                            await redisCall<number>(
                                'lpush',
                                `games:${gameId}:swaps`,
                                ...swaps.map(([p, card1, card2, order]) => `${p}:${card1}:${card2}:${order}`),
                            );
                        }

                        if (typeof result == 'string') {
                            // legal action; new revelation returned
                            // push action and revelation to redis
                            await redisCall<number>(
                                'rpush',
                                `games:${gameId}:events`,
                                `a:${playerId}:${action}`,
                                `r:${playerId}:${result}`,
                            );
                            ws.send(JSON.stringify({
                                type: 'revelation',
                                revelation: result,
                            }));
                        } else if (result === true) {
                            // legal action; turn is over
                            await redisCall<number>(
                                'rpush',
                                `games:${gameId}:events`,
                                `a:${playerId}:${action}`,
                            );
                            await redisCall<number>('sadd', `games:${gameId}:completedTurns`, playerId);
                            ws.send(JSON.stringify({
                                type: 'stage',
                                stage: 'wait',
                            }));

                            // see if everyone has finished their action
                            if (await redisCall<number>('scard', `games:${gameId}:completedTurns`) == await redisCall<number>('scard', `games:${gameId}:playersInGame`)) {
                                // start discussion
                                await redisCall('set', `games:${gameId}:stage`, 'discussion');
                                const discussionLength = parseInt(await redisCall<string>('get', `games:${gameId}:config:discussionLength`)),
                                    discussionEndTime = Math.floor(Date.now() / 1000) + discussionLength;
                                console.log(`${discussionLength} seconds after ${Math.floor(Date.now() / 1000)} = ${discussionEndTime}`);
                                await redisCall('hset', 'discussionEndTimes', gameId, discussionEndTime.toString());

                                broadcast(gameId, {
                                    type: 'stage',
                                    stage: 'discussion',
                                }, true);
                                broadcast(gameId, {
                                    type: 'discussionEndTime',
                                    time: discussionEndTime,
                                }, true);
                            }
                        }

                        // see if that allowed new players to take actions
                        for (const p of await redisCall<string[]>('smembers', `games:${gameId}:waiting`)) {
                            if (canTakeAction(p, await getAssignedCards(gameId), await redisCall<string[]>('smembers', `games:${gameId}:completedTurns`))) {
                                console.log(`allowing ${p} to take action because ${playerId} finished their action`);
                                await redisCall<number>('srem', `games:${gameId}:waiting`, p);

                                if (!(await redisCall<number>('hexists', 'forcedWaits', `${gameId}:${p}`))) {
                                    await askPlayerForAction(gameId, p);
                                }
                            }
                        }
                    } else {
                        // illegal action
                        killConnection(ws, 'Illegal action.');
                    }
                } else if (
                    message.type == 'vote'
                    && await redisCall<string>('get', `games:${gameId}:stage`) == 'voting'
                    && await redisCall<number>('sismember', `games:${gameId}:playersInGame`, playerId)
                    && (message.vote == '' || await redisCall<number>('sismember', `games:${gameId}:playersInGame`, message.vote))
                    && !(await redisCall<number>('hexists', `games:${gameId}:votes`, playerId))
                ) {
                    // tally the vote
                    await redisCall('hset', `games:${gameId}:votes`, playerId, message.vote);
                    ws.send(JSON.stringify({
                        type: 'stage',
                        stage: 'wait',
                    }));

                    // check if all votes are in
                    if (await redisCall<number>('hlen', `games:${gameId}:votes`) == await redisCall<number>('scard', `games:${gameId}:playersInGame`)) {
                        await redisCall('set', `games:${gameId}:stage`, 'results');

                        const initialCards = await getAssignedCards(gameId),
                            initialCenter = await getCenter(gameId),
                            swaps = await getSwaps(gameId),
                            votes = await redisCall<{ [id: string]: string }>('hgetall', `games:${gameId}:votes`),
                            results = getResults(
                                initialCards,
                                initialCenter,
                                swaps,
                                votes,
                            );

                        await redisCall('set', `games:${gameId}:results`, JSON.stringify({
                            ...results,
                            initialCards,
                            initialCenter,
                            swaps,
                            votes,
                        }));
                        await broadcast(gameId, {
                            type: 'stage',
                            stage: 'results',
                        }, true);
                        await broadcast(gameId, {
                            type: 'results',
                            results: {
                                ...results,
                                initialCards,
                                initialCenter,
                                swaps,
                                votes,
                            },
                        }, true);
                    }
                } else if (message.type == 'restart' && await isLeader(gameId, playerId)) {
                    await redisCall('set', `games:${gameId}:stage`, 'lobby');
                    await redisCall('del', ...[
                        'playersInGame',
                        'cardsInPlay',
                        'assignedCards',
                        'center',
                        'haveConfirmed',
                        'events',
                        'completedTurns',
                        'swaps',
                        'waiting',
                        'votes',
                        'results'
                    ].map(k => `games:${gameId}:${k}`));
                    await redisCall('hdel', 'discussionEndTimes', gameId);

                    await broadcast(gameId, {
                        type: 'stage',
                        stage: 'lobby',
                        restart: true,
                    }, false);
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

            // don't destroy the game
            if (await redisCall<number>('hexists', 'expirationTimes', gameId)) {
                console.log(`Cancelling expiration for ${gameId}`);
            }
            await redisCall('hdel', 'expirationTimes', gameId);

            const stage = await redisCall<string>('get', `games:${gameId}:stage`);

            if (stage != 'lobby') {
                if (await redisCall<number>('sismember', `games:${gameId}:playersInGame`, playerId)) {
                    const events = await getEvents(gameId, playerId);
                    ws.send(JSON.stringify({
                        type: 'events',
                        events: events.map(e => ([
                            e.split(':')[0],
                            e.split(':')[2],
                        ])),
                    }));

                    if (stage != 'turns' && stage != 'voting') {
                        ws.send(JSON.stringify({
                            type: 'stage',
                            stage,
                        }));
                    } else if (stage == 'turns') {
                        // (waiting for dependencies' actions) OR (has finished their turn)
                        if (
                            await redisCall<number>('sismember', `games:${gameId}:waiting`, playerId)
                            || await redisCall<number>('sismember', `games:${gameId}:completedTurns`, playerId)
                            || await redisCall<number>('hexists', 'forcedWaits', `${gameId}:${playerId}`)
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
                        }
                    } else {
                        if (await redisCall<number>('hexists', `games:${gameId}:votes`, playerId)) {
                            ws.send(JSON.stringify({
                                type: 'stage',
                                stage: 'wait',
                            }));
                        } else {
                            ws.send(JSON.stringify({
                                type: 'stage',
                                stage: 'voting',
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
                                await redisCall<number>('llen', `games:${gameId}:cardsInPlay`) - 1
                            ),
                        }));

                        ws.send(JSON.stringify({
                            type: 'yourCard',
                            card: await redisCall<string>('hget', `games:${gameId}:assignedCards`, playerId),
                        }));
                    }

                    if (stage == 'discussion') {
                        ws.send(JSON.stringify({
                            type: 'discussionEndTime',
                            time: parseInt(await redisCall<string>('hget', 'discussionEndTimes', gameId)),
                        }));
                    }

                    if (stage == 'results') {
                        ws.send(JSON.stringify({
                            type: 'results',
                            results: JSON.parse(await redisCall<string>('get', `games:${gameId}:results`)),
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

    runChecksInBackground();

    // set expiration timers on all games in case no one connects
    (async () => {
        for (const gameId of await redisCall<string[]>('hkeys', 'gameKeys')) {
            await redisCall('hset', 'expirationTimes', gameId, Math.floor(Date.now() / 1000 + 600).toString());
        }
    })();

    return handleConnection;
}
