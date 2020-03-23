import React from 'react';
import { observer } from 'mobx-react';

import { StoreProps, Player } from './WerewolfState';
import Werewolf from './turns/Werewolf';
import Seer from './turns/Seer';

const Turn = observer(({ store }: StoreProps): JSX.Element => {
    if (store.ownCard == 'werewolf') {
        return (
            <Werewolf
                players={store.playersInGame}
                revelations={store.revelations}
                onAction={(action) => console.log(`werewolf action: ${action}`)}
            />
        );
    } else if (store.ownCard == 'seer') {
        return (
            <Seer
                players={store.playersInGame}
                revelations={store.revelations}
                onAction={(action) => console.log(`seer action: ${action}`)}
            />
        );
    } else {
        return (
            <div className="Turn">
                Turn for {store.ownCard}<br />
                Info: {store.revelations.join('; ')}
            </div>
        );
    }
});

export default Turn;

export type TurnComponent = (props: {
    players: Player[],
    revelations: string[],
    onAction: (action: string) => void,
}) => JSX.Element;
