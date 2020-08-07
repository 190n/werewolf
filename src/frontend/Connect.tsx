import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { observer } from 'mobx-react';
import { ReadyState } from 'react-use-websocket';

import { Link } from './ui';
import { StoreProps } from './WerewolfState';
import useSharedSocket from './use-shared-socket';

const Connect = observer(({ store }: StoreProps): JSX.Element => {
    const { gameId, playerId } = useParams<{ gameId: string, playerId: string }>();
    const [endReason, setEndReason] = useState<string | undefined>(undefined);

    const [sendMessage, lastMessage, readyState] = useSharedSocket();

    const connectionStatus: string = {
        [ReadyState.CONNECTING]: 'Connecting...',
        [ReadyState.OPEN]: 'Waiting for server...',
        [ReadyState.CLOSING]: 'Server is closing connection...',
        [ReadyState.CLOSED]: 'Connection closed by server:',
    }[readyState];

    store.gameId = gameId;
    store.ownId = playerId;

    return (
        <>
            <h1>
                Joining {gameId}...
            </h1>
            <p>
                {connectionStatus}<br />
                {endReason && endReason}
            </p>
            <p>
                <Link to="/">Back</Link>
            </p>
        </>
    );
});

export default Connect;
