import React from 'react';
import { observer } from 'mobx-react';

import { Button, Tag } from '../ui';
import { TurnComponent } from '../Turn';
import { getPlayersFromRevelation } from '../util';

const Mason: TurnComponent = observer(({ store: { playersInGame, revelations }, onAction }) => {
    if (revelations.length == 0) {
        return (
            <p>Waiting for server...</p>
        );
    } else {
        let message: JSX.Element;

        const otherMasons = getPlayersFromRevelation(revelations[0], playersInGame);
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
                    The other <Tag card="mason">masons</Tag> are&nbsp;
                    <strong>{otherMasons[0].nick}</strong> and&nbsp;
                    <strong>{otherMasons[1].nick}</strong>.
                </p>
            );
        }

        return (
            <>
                {message}
                <Button onClick={() => onAction('')}>OK</Button>
            </>
        );
    }
});

export default Mason;
