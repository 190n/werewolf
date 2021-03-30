import http from 'http';
import net from 'net';

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

const redisClient = redis.createClient();
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

server.listen(5000, () => {
    console.log('Listening on port 5000');
});
