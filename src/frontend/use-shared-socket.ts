import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { SendMessage, Options } from 'react-use-websocket/src/lib/use-websocket';

export default function useSharedSocket(options: Omit<Options, 'share' | 'queryParams' | 'retryOnError'> = {}): [SendMessage, MessageEvent, ReadyState, () => WebSocket] {
    const { gameId, playerId } = useParams();

    if (gameId === undefined || playerId === undefined) {
        throw new Error('useSharedSocket must be used from route with :gameId and :playerId');
    }

    const fullOptions = useMemo(() => ({
        share: true,
        queryParams: { gameId, playerId },
        retryOnError: true,
        ...options,
    }), []);

    return useWebSocket('ws://localhost:5000/connect', fullOptions);
}
