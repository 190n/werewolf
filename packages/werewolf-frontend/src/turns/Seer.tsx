import React, { useState } from 'react';
import { observer } from 'mobx-react';

import { Button, ButtonGroup, Tag, ToggleButton, ToggleButtonCapitalized } from '../ui';
import { TurnComponent } from '../Turn';

const Seer: TurnComponent = observer(({ store: { playersInGame, revelations, ownActions, ownId, nicks }, onAction }) => {
    const [choice1, setChoice1] = useState(''),
        [choice2, setChoice2] = useState('');

    function setPlayerChoice(c: string) {
        setChoice1(c);
        setChoice2('');
    }

    function setCenterChoice(c: string) {
        if (choice1.length > 1) setChoice1('');
        if (choice2.length > 1) setChoice2('');

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
                <ButtonGroup wrap align="center">
                    {playersInGame.filter(p => p.id != ownId).map(p => (
                        <ToggleButton
                            key={p.id}
                            checked={choice1 == p.id}
                            onChange={() => setPlayerChoice(p.id)}
                            disabled={ownActions.length > 0}
                        >
                            {p.nick}
                        </ToggleButton>
                    ))}
                </ButtonGroup>
                <ButtonGroup align="center">
                    {['Left', 'Middle', 'Right'].map((pos, i) => (
                        <ToggleButton
                            key={pos}
                            checked={choice1 == i.toString() || choice2 == i.toString()}
                            onChange={() => setCenterChoice(i.toString())}
                            disabled={ownActions.length > 0}
                            color="gray"
                        >
                            {pos}
                        </ToggleButton>
                    ))}
                </ButtonGroup>
                <Button
                    onClick={submitChoices}
                    disabled={
                        (choice1.length > 1 ? false : (choice1.length == 0 || choice2.length == 0))
                        || ownActions.length > 0
                    }
                >
                    OK
                </Button>
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
                    <strong>{nicks[ownActions[0]]}</strong>
                    's card was the <Tag card={revelations[0]} />.
                </p>
            );
        }

        return (
            <>
                {message}
                <Button onClick={() => onAction('')} disabled={ownActions.length > 1}>OK</Button>
            </>
        );
    }
});

export default Seer;
