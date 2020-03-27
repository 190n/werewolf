import React from 'react';

import { Player } from '../WerewolfState';
import { TurnComponent } from '../Turn';
import Tag from '../Tag';

const Mason: TurnComponent = ({ players, revelations, onAction }) => {
    if (revelations.length == 0) {
        return (
            <p>Waiting for server...</p>
        );
    } else {
        let message: JSX.Element;

        const otherMasons = revelations[0].split(',').map(id => players.find(p => p.id == id)).filter(p => p !== undefined) as Player[];
        if (otherMasons.length == 0) {
            message = (
                <p>You are the only <Tag card="mason" />.</p>
            );
        } else if (otherMasons.length == 1) {
            message = (
                <p>
                    The other <Tag card="mason" /> is <strong>{otherMasons[0].nick}</strong>.
                </p>
            );
        } else {
            message = (
                <p>
                    The other <Tag card="mason" text="masons" /> are&nbsp;
                    <strong>{otherMasons[0].nick}</strong> and&nbsp;
                    <strong>{otherMasons[1].nick}</strong>.
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

export default Mason;
