import React, { useState } from 'react';
import { observer } from 'mobx-react';

import { Button, ButtonGroup, ToggleButton } from '../ui';
import { TurnComponent } from '../Turn';

const Troublemaker: TurnComponent = observer(({ store: { playersInGame, ownActions, ownId }, onAction }) => {
    const [choice1, setChoice1] = useState(''),
        [choice2, setChoice2] = useState('');

    function choose(c: string) {
        if (choice1 == c) {
            return setChoice1('');
        } else if (choice2 == c) {
            return setChoice2('');
        } else if (choice1 == '') {
            return setChoice1(c);
        } else if (choice2 == '') {
            return setChoice2(c);
        } else {
            setChoice1(c);
            setChoice2('');
        }
    }

    return (
        <>
            <p>
                Choose two other players' cards to switch:
            </p>
            <ButtonGroup wrap align="center">
                {playersInGame.filter(p => p.id != ownId).map(p => (
                    <ToggleButton
                        key={p.id}
                        checked={choice1 == p.id || choice2 == p.id}
                        onChange={() => choose(p.id)}
                        disabled={ownActions.length > 0}
                    >
                        {p.nick}
                    </ToggleButton>
                ))}
            </ButtonGroup>
            <Button
                onClick={() => onAction(`${choice1},${choice2}`)}
                disabled={ownActions.length > 0 || choice1 == '' || choice2 == ''}
            >
                OK
            </Button>
        </>
    );
});

export default Troublemaker;
