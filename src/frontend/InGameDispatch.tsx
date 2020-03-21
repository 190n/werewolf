import React from 'react';
import { observer } from 'mobx-react';

import useSharedSocket from './use-shared-socket';
import { StoreProps } from './WerewolfState';
import Connect from './Connect';
import Lobby from './Lobby';
import CardSelection from './CardSelection';
import ViewCard from './ViewCard';
import Wait from './Wait';
import Turn from './Turn';

const InGameDispatch = observer(({ store }: StoreProps): JSX.Element => {
    function onMessage({ data }: MessageEvent) {
        try {
            const message = JSON.parse(data);
            if (message.type == 'end') {
                store.stage = 'disconnected';
                store.disconnectReason = message.reason;
            } else if (message.type == 'stage') {
                store.stage = message.stage;
            } else if (message.type == 'players') {
                store.players = message.players;
            } else if (message.type == 'playersInGame') {
                store.playerIdsInGame = message.players;
            } else if (message.type == 'cardsInPlay') {
                store.cardsInPlay = message.cardsInPlay;
            } else if (message.type == 'yourCard') {
                store.ownCard = message.card;
            }
        } catch (e) {}
    }

    function onClose({ reason }: CloseEvent) {
        store.stage = 'disconnected';
        store.disconnectReason = reason;
    }

    useSharedSocket({ onMessage, onClose });

    return {
        joining: <Connect store={store} />,
        lobby: <Lobby store={store} />,
        cardSelection: <CardSelection store={store} />,
        viewCard: <ViewCard store={store} />,
        wait: <Wait />,
        action: <Turn store={store} />,
        disconnected: <p>Disconnected: {store.disconnectReason}</p>,
    }[store.stage];
});

export default InGameDispatch;
