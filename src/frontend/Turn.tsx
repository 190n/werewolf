import React, { useState } from 'react';
import { observer } from 'mobx-react';

import WerewolfState, { StoreProps } from './WerewolfState';
import Werewolf from './turns/Werewolf';
import Minion from './turns/Minion';
import Mason from './turns/Mason';
import Seer from './turns/Seer';
import Robber from './turns/Robber';
import Troublemaker from './turns/Troublemaker';
import Drunk from './turns/Drunk';
import Insomniac from './turns/Insomniac';
import useSharedSocket from './use-shared-socket';

const Turn = observer(({ store }: StoreProps): JSX.Element => {
    const [sendMessage] = useSharedSocket();
    const [action, setAction] = useState('');

    function onAction(action: string) {
        sendMessage(JSON.stringify({
            type: 'action',
            action,
        }));
        store.events.push(['a', action]);
    }

    const components: { [card: string]: TurnComponent } = {
        werewolf: Werewolf,
        mason: Mason,
        minion: Minion,
        seer: Seer,
        robber: Robber,
        troublemaker: Troublemaker,
        drunk: Drunk,
        insomniac: Insomniac,
    };

    if (components.hasOwnProperty(store.ownCard as string)) {
        return React.createElement(components[store.ownCard as string], {
            store,
            onAction,
        });
    } else {
        return (
            <p>Waiting for server...</p>
        );
    }
});

export default Turn;

export type TurnComponent = (props: {
    store: WerewolfState,
    onAction: (action: string) => void,
}) => JSX.Element;
