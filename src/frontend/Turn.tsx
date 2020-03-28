import React, { useState } from 'react';
import { observer } from 'mobx-react';

import WerewolfState, { StoreProps } from './WerewolfState';
import Werewolf from './turns/Werewolf';
import Minion from './turns/Minion';
import Mason from './turns/Mason';
import Seer from './turns/Seer';
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

    if (store.ownCard == 'werewolf' || store.ownCard == 'mason' || store.ownCard == 'minion' || store.ownCard == 'seer') {
        const component = {
            werewolf: Werewolf,
            mason: Mason,
            minion: Minion,
            seer: Seer,
        }[store.ownCard];

        return React.createElement(component, {
            store,
            onAction,
        });
    } else {
        return (
            <>
                <p>
                    You are the&nbsp;
                    <span className={`tag ${store.ownCard}`}>{store.ownCard}</span>
                </p>
                <p>
                    <input
                        type="text"
                        value={action}
                        onChange={e => setAction(e.target.value)}
                    />
                    <button onClick={() => onAction(action)}>Submit action</button>
                </p>
            </>
        );
    }
});

export default Turn;

export type TurnComponent = (props: {
    store: WerewolfState,
    onAction: (action: string) => void,
}) => JSX.Element;
