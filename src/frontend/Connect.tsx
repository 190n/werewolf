import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { observer } from 'mobx-react';
import { ReadyState } from 'react-use-websocket';
import { Heading, Text } from '@chakra-ui/core';

import Link from './Link';
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
            <Heading>
                Joining {gameId}...
            </Heading>
            <Text>
                {connectionStatus}<br />
                {endReason && endReason}
            </Text>
            <Text>
                <Link to="/">Back</Link>
            </Text>
        </>
    );
});

export default Connect;
