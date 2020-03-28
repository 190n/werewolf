import React, { useState } from 'react';
import { observer } from 'mobx-react';

import { TurnComponent } from '../Turn';
import Tag from '../Tag';

const Seer: TurnComponent = observer(({ store: { playersInGame, revelations, ownActions, ownId }, onAction }) => {
    const [choice1, setChoice1] = useState(''),
        [choice2, setChoice2] = useState(''),
        [nextChoice, setNextChoice] = useState(0);

    function setPlayerChoice(c: string) {
        setChoice1(c);
        setChoice2('');
    }

    function setCenterChoice(i: number) {
        if (i.toString() == choice1 || i.toString() == choice2) return;

        if (choice1.length > 1) setChoice1('');
        if (choice2.length > 1) setChoice2('');

        if (nextChoice == 0) {
            setChoice1(i.toString());
            setNextChoice(1);
        } else {
            setChoice2(i.toString());
            setNextChoice(0);
        }
    }

    function submitChoices() {
        if (choice1.length > 1) {
            onAction(choice1);
        } else {
            onAction(`${choice1},${choice2}`);
        }
    }

    if (revelations.length == 0) {
        return (
            <>
                <p>
                    Choose one other player's card, or two cards in the center, to look at:
                </p>
                {playersInGame.filter(p => p.id != ownId).map(p => (
                    <label htmlFor={p.id} key={p.id}>
                        <input
                            type="radio"
                            id={p.id}
                            name="playersCard"
                            checked={choice1 == p.id}
                            onChange={() => setPlayerChoice(p.id)}
                            disabled={ownActions.length > 0}
                        />
                        {p.nick}
                        <br />
                    </label>
                ))}
                <p />
                {['Left', 'Middle', 'Right'].map((pos, i) => (
                    <label htmlFor={pos} key={i}>
                        <input
                            type="checkbox"
                            id={pos}
                            checked={choice1 == i.toString() || choice2 == i.toString()}
                            onChange={() => setCenterChoice(i)}
                            disabled={ownActions.length > 0}
                        />
                        {pos}
                        <br />
                    </label>
                ))}
                <p>
                    <button
                        onClick={submitChoices}
                        disabled={
                            (choice1.length > 1 ? false : (choice1.length == 0 || choice2.length == 0))
                            || ownActions.length > 0
                        }
                    >
                        OK
                    </button>
                </p>
            </>
        );
    } else {
        let message: JSX.Element;

        if (revelations[0].includes(',')) {
            const indices = ownActions[0].split(',').map(i => parseInt(i)),
                positions = indices.map(i => ['leftmost', 'middle', 'rightmost'][i]),
                cards = revelations[0].split(',');

            message = (
                <p>
                    The {positions[0]} card was the <Tag card={cards[0]} />, and the&nbsp;
                    {positions[1]} card was the <Tag card={cards[1]} />.
                </p>
            );
        } else {
            message = (
                <p>
                    <strong>{playersInGame.find(p => p.id == ownActions[0])?.nick}</strong>
                    's card was the <Tag card={revelations[0]} />.
                </p>
            );
        }

        return (
            <>
                {message}
                <button onClick={() => onAction('')} disabled={ownActions.length > 1}>OK</button>
            </>
        );
    }
});

export default Seer;
