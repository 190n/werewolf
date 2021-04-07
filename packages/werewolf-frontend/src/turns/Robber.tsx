import React, { useState } from 'react';
import { observer } from 'mobx-react';

import { Button, ButtonGroup, Tag, ToggleButton } from '../ui';
import { TurnComponent } from '../Turn';

const Robber: TurnComponent = observer(({ store: { playersInGame, revelations, ownActions, ownId, nicks }, onAction }) => {
    const [choice, setChoice] = useState('');

    if (revelations.length == 0) {
        return (
            <>
                <p>
                    Choose one other player's card to switch with your own:
                </p>
                <ButtonGroup wrap align="center">
                    {playersInGame.filter(p => p.id != ownId).map(p => (
                        <ToggleButton
                            key={p.id}
                            checked={choice == p.id}
                            onChange={() => setChoice(p.id)}
                            disabled={ownActions.length > 0}
                        >
                            {p.nick}
                        </ToggleButton>
                    ))}
                </ButtonGroup>
                <Button onClick={() => onAction(choice)} disabled={ownActions.length > 0}>OK</Button>
            </>
        );
    } else {
        return (
            <>
                <p>
                    <strong>{nicks[ownActions[0]]}</strong>'s card
                    was the <Tag card={revelations[0]} />. You now have that card, and they have
                    your <Tag card="robber" /> card.
                </p>
                <Button onClick={() => onAction('')} disabled={ownActions.length > 1}>OK</Button>
            </>
        );
    }
});

export default Robber;
