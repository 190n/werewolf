import React from 'react';

import { TurnComponent } from '../Turn';
import { getPlayersFromRevelation } from '../util';
import Tag from '../Tag';
import PlayerNameList from '../PlayerNameList';

const Minion: TurnComponent = ({ players, revelations, onAction }) => {
    if (revelations.length == 0) {
        return (
            <p>Waiting for server...</p>
        );
    } else {
        const werewolves = getPlayersFromRevelation(revelations[0], players);
        let message: JSX.Element;

        if (werewolves.length == 1) {
            message = (
                <p>
                    The only <Tag card="werewolf" /> is <strong>{werewolves[0].nick}</strong>
                </p>
            );
        } else {
            message = (
                <p>
                    The <Tag card="werewolf" text="werewolves" /> are <PlayerNameList players={werewolves} />.
                </p>
            );
        }

        return (
            <>
                {message}
                <button onClick={() => onAction('')}>OK</button>
            </>
        );
    }
};

export default Minion;
