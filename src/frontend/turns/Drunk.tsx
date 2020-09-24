import React, { useState } from 'react';
import { observer } from 'mobx-react';

import { Button, ButtonGroup, Tag, ToggleButton } from '../ui';
import { TurnComponent } from '../Turn';

const Drunk: TurnComponent = observer(({ store: { ownActions, revelations }, onAction }) => {
    const [choice, setChoice] = useState(-1);

    if (revelations.length == 0) {
        return (
            <>
                <p>
                    Choose a card from the center to switch with your own:
                </p>
                <ButtonGroup align="center">
                    {['Left', 'Middle', 'Right'].map((pos, i) => (
                        <ToggleButton
                            checked={choice == i}
                            onChange={() => setChoice(i)}
                            disabled={ownActions.length > 0}
                        >
                            {pos}
                        </ToggleButton>
                    ))}
                </ButtonGroup>
                <Button
                    onClick={() => onAction(choice.toString())}
                    disabled={choice == -1 || ownActions.length > 0}
                >
                    OK
                </Button>
            </>
        );
    } else {
        return (
            <>
                <p>
                    The <strong>{['leftmost', 'middle', 'rightmost'][parseInt(ownActions[0])]}</strong>
                    &nbsp;card in the center was the <Tag card={revelations[0]} />. You now have that
                    card, and your original card is in the center.
                </p>
                <Button onClick={() => onAction('')} disabled={ownActions.length > 1}>OK</Button>
            </>
        );
    }
});

export default Drunk;
