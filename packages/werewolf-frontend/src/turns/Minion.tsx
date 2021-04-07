import React from 'react';
import { observer } from 'mobx-react';

import { Button, Tag } from '../ui';
import { TurnComponent } from '../Turn';
import { getPlayersFromRevelation } from '../util';
import PlayerNameList from '../PlayerNameList';

const Minion: TurnComponent = observer(({ store: { playersById, revelations, ownActions }, onAction }) => {
    if (revelations.length == 0) {
        return (
            <p>Waiting for server...</p>
        );
    } else {
        const werewolves = getPlayersFromRevelation(revelations[0], playersById);
        let message: JSX.Element;

        if (werewolves.length == 1) {
            message = (
                <p>
                    The only <Tag card="werewolf" /> is <strong>{werewolves[0].nick}</strong>.
                </p>
            );
        } else if (werewolves.length == 0) {
            message = (
                <p>
                    There are no <Tag card="werewolf">werewolves</Tag>.
                </p>
            );
        } else {
            message = (
                <p>
                    The <Tag card="werewolf">werewolves</Tag> are <PlayerNameList players={werewolves} />.
                </p>
            );
        }

        return (
            <>
                {message}
                <Button onClick={() => onAction('')} disabled={ownActions.length > 0}>OK</Button>
            </>
        );
    }
});

export default Minion;
