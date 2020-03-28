import React, { useState } from 'react';
import { observer } from 'mobx-react';

import { TurnComponent } from '../Turn';
import Tag from '../Tag';

const Drunk: TurnComponent = observer(({ store: { ownActions, revelations }, onAction }) => {
    const [choice, setChoice] = useState(-1);

    if (revelations.length == 0) {
        return (
            <>
                <p>
                    Choose a card from the center to switch with your own:
                </p>
                <p>
                    {['Left', 'Middle', 'Right'].map((pos, i) => (
                        <label htmlFor={pos} key={i}>
                            <input
                                type="radio"
                                id={pos}
                                name="cardFromCenter"
                                checked={choice == i}
                                onChange={() => setChoice(i)}
                                disabled={ownActions.length > 0}
                            />
                            {pos}
                        </label>
                    ))}
                </p>
                <p>
                    <button onClick={() => onAction(choice.toString())} disabled={choice == -1 || ownActions.length > 0}>OK</button>
                </p>
            </>
        );
    } else {
        return (
            <>
                <p>
                    The <strong>{['leftmost', 'middle', 'rightmost'][parseInt(ownActions[0])]}</strong>
                    &nbsp;card in the center was the <Tag card={revelations[0]} />. You now have that
                    card, and the <Tag card="drunk" /> card is in the center.
                </p>
                <button onClick={() => onAction('')} disabled={ownActions.length > 1}>OK</button>
            </>
        );
    }
});

export default Drunk;
