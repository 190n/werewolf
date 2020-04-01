import { Express } from 'express';
import { Commands } from 'redis';

import { generateId } from './util';

export default async function createApi(app: Express, redisCall: <T>(command: keyof Commands<boolean>, ...args: any[]) => Promise<T>) {
    async function generateIdForPlayer(gameId: string, len: number = 16) {
        const numPlayers = await redisCall<number>('scard', `games:${gameId}:players`);
        return generateId(len, numPlayers + 1);
    }
    async function createGameId(): Promise<string|null> {
        const len = await redisCall<number>('hlen', 'gameKeys');
        if (len >= 1000000) {
            return null;
        }

        const generateCode = () => {
            let code = Math.floor(Math.random() * 1000000).toString();
            if (code.length < 6) {
                code = '0'.repeat(6 - code.length) + code;
            }
            return code;
        };

        let code = generateCode();
        while (await redisCall<number>('hexists', 'gameKeys', code)) {
            code = generateCode();
        }

        return code;
    }

    app.get('/games/create', async (req, res) => {
        const { nick } = req.query;
        if (!nick) {
            res.status(400);
            res.json({ gameId: null, key: null, error: 'Nickname (nick) must be specified in querystring.' });
            return;
        }

        const gameId = await createGameId(),
            key = generateId(16, 0);
        if (gameId != null) {
            await redisCall('hset', 'gameKeys', gameId, key);
            await redisCall('sadd', `games:${gameId}:players`, key);
            await redisCall('set', `games:${gameId}:stage`, 'lobby');
            await redisCall('hset', `games:${gameId}:nicks`, key, nick);
            // game will be deleted of no one connects
            await redisCall('hset', 'expirationTimes', gameId, Math.floor(Date.now() / 1000 + 600).toString());
            res.status(201);
            res.json({ gameId, key });
        } else {
            res.status(503);
            res.json({ gameId: null, key: null });
        }
    });

    app.get('/games/count', async (req, res) => {
        res.end((await redisCall<number>('hlen', 'gameKeys')).toString());
    });

    app.get('/games/reset', async (req, res) => {
        res.end((await redisCall<number>('del', 'gameKeys')).toString());
    });

    app.get('/games/join', async (req, res) => {
        const { gameId, nick } = req.query;

        if (gameId === undefined || nick === undefined) {
            res.status(400);
            res.json({ id: null, error: 'Must specify gameId and nick in querystring.' });
            return;
        }

        if (nick == '') {
            res.status(400);
            res.json({ id: null, error: 'Your nickname cannot be empty.' });
            return;
        }

        // game exists?
        if (await redisCall<number>('hexists', 'gameKeys', gameId)) {
            // nickname taken?
            if ((await redisCall<string[]>('hvals', `games:${gameId}:nicks`)).includes(nick)) {
                res.status(403);
                res.json({ id: null, error: 'That nickname is taken.' });
                return;
            }

            // generate an id
            const id = await generateIdForPlayer(gameId);
            // save it to redis
            await redisCall('sadd', `games:${gameId}:players`, id);
            await redisCall('hset', `games:${gameId}:nicks`, id, nick);
            // 201
            res.status(201);
            // return id to player
            res.json({ id, error: null });
        } else {
            // game does not exist
            // 404
            res.status(404);
            // helpful error message
            res.json({ id: null, error: 'No such game exists. Make sure you typed the join code correctly.' });
        }
    });
}
