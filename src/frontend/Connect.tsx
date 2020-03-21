import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { observer } from 'mobx-react';
import { ReadyState } from 'react-use-websocket';

import { StoreProps } from './WerewolfState';
import useSharedSocket from './use-shared-socket';

const Connect = observer(({ store }: StoreProps): JSX.Element => {
    const { gameId, playerId } = useParams<{ gameId: string, playerId: string }>();
    const [endReason, setEndReason] = useState<string | undefined>(undefined);

    const [sendMessage, lastMessage, readyState, getWebSocket] = useSharedSocket();

    const connectionStatus: string = {
        [ReadyState.CONNECTING]: 'Connecting...',
        [ReadyState.OPEN]: 'Waiting for server...',
        [ReadyState.CLOSING]: 'Server is closing connection...',
        [ReadyState.CLOSED]: 'Connection closed by server:',
    }[readyState];

    store.gameId = gameId;
    store.ownId = playerId;

    return (
        <div className="Rejoin">
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
        </div>
    );
});

export default Connect;
