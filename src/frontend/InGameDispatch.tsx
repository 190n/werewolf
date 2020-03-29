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
import Vote from './Vote';
import Discussion from './Discussion';

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
            } else if (message.type == 'revelation') {
                store.events.push(['r', message.revelation]);
            } else if (message.type == 'events') {
                store.events = store.events.concat(message.events);
            } else if (message.type == 'discussionEndTime') {
                store.discussionEndTime = message.time;
            } else if (message.type == 'results') {
                store.results = message.results;
            }
        } catch (e) {}
    }

    function onClose({ reason }: CloseEvent) {
        store.stage = 'disconnected';
        store.disconnectReason = reason;
    }

    useSharedSocket({ onMessage, onClose });

    const mainComponent = {
        joining: <Connect store={store} />,
        lobby: <Lobby store={store} />,
        cardSelection: <CardSelection store={store} />,
        viewCard: <ViewCard store={store} />,
        wait: <Wait store={store} />,
        action: <Turn store={store} />,
        discussion: <Discussion store={store} />,
        voting: <Vote store={store} />,
        disconnected: <p>Disconnected: {store.disconnectReason}</p>,
        results: <p>Results: {JSON.stringify(store.results)}</p>,
    }[store.stage];

    return (
        <>
            {mainComponent}
            <ul>
                <li>
                    You are the&nbsp;
                    <span className={`tag ${store.ownCard}`}>{store.ownCard}</span>
                </li>
                {store.events.map(([type, value], i) => (
                    <li key={i}>
                        {type == 'r' ? 'Revelation' : 'Action'}:&nbsp;
                        {value}
                    </li>
                ))}
            </ul>
        </>
    );
});

export default InGameDispatch;
