import React, { useState } from 'react';
import { observer } from 'mobx-react';

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
            {playersInGame.filter(p => p.id != ownId).map(p => (
                <label htmlFor={p.id} key={p.id}>
                    <input
                        type="checkbox"
                        id={p.id}
                        checked={choice1 == p.id || choice2 == p.id}
                        onClick={() => choose(p.id)}
                        disabled={ownActions.length > 0}
                    />
                    {p.nick}
                    <br />
                </label>
            ))}
            <p>
                <button
                    onClick={() => onAction(`${choice1},${choice2}`)}
                    disabled={ownActions.length > 0 || choice1 == '' || choice2 == ''}
                >
                    OK
                </button>
            </p>
        </>
    );
});

export default Troublemaker;
