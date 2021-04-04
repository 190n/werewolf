import http from 'http';
import net from 'net';
import fs from 'fs';

import express from 'express';
import WebSocket from 'ws';
import redis from 'redis';
import qs from 'qs';

import createApi from './api';
import createHandler from './connection';

const app = express();

app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    next();
});

const staticRoot = process.env.STATIC_ROOT;
if (typeof staticRoot == 'string' && fs.statSync(staticRoot).isDirectory) {
    app.use((req, res, next) => {
        // url is either /[number]... or /(create|cheatsheet)/?
        if (/^\/\d|^\/(create|cheatsheet)\/?$/.test(req.url)) {
            req.url = '/';
        } else if (/^\/(backend|lib)/.test(req.url)) {
            res.status(404);
        }
        next();
    });

    app.use(express.static(staticRoot, {
        setHeaders(res, path) {
            if (path.endsWith('index.html')) {
                // don't cache index.html
                res.setHeader('Cache-Control', 'no-cache');
            } else {
                // cache everything else for a year since they are fingerprinted
                res.setHeader('Cache-Control', 'public, max-age=31536000');
            }
        }
    }));
}

const redisClient = redis.createClient(process.env.REDIS_URL ?? 'redis://localhost:6379');
redisClient.on('error', err => {
    console.error(`Redis error: ${err}`);
});

const redisCall = <T>(command: keyof redis.Commands<boolean>, ...args: any[]): Promise<T> => {
    type commandType = (args: any[], cb: (err: any, reply: T) => void) => void;

    return new Promise((resolve, reject) => {
        const exec = redisClient[command] as commandType;
        exec.call(redisClient, args, (err, result) => {
            if (err) {
                return reject(err);
            }

            resolve(result);
        });
    });
};

createApi(app, redisCall);
const handleConnection = createHandler(redisCall);

const server = http.createServer(app);
const wss = new WebSocket.Server({ clientTracking: false, noServer: true });

server.on('upgrade', (request: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
    if (request.url?.startsWith('/connect?')) {
        const queryString = qs.parse(request.url.split('/connect?')[1]);

        if (typeof queryString.gameId != 'string' || typeof queryString.playerId != 'string') {
            return socket.destroy();
        }

        wss.handleUpgrade(request, socket, head, ws => {
            wss.emit('connection', ws, request);
            handleConnection(ws, queryString.gameId as string, queryString.playerId as string);
        });
    } else {
        socket.destroy();
    }
});

const port = parseInt(process.env.PORT ?? '5000');

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
