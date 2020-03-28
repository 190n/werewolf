import React, { useState } from 'react';

import { TurnComponent } from '../Turn';
import Tag from '../Tag';

const Robber: TurnComponent = ({ store: { playersInGame, revelations, ownActions, ownId }, onAction }) => {
    const [choice, setChoice] = useState('');

    if (revelations.length == 0) {
        return (
            <>
                <p>
                    Choose one other player's card to switch with your own:
                </p>
                {playersInGame.filter(p => p.id != ownId).map(p => (
                    <label htmlFor={p.id} key={p.id}>
                        <input
                            type="radio"
                            id={p.id}
                            name="playersCard"
                            checked={choice == p.id}
                            onChange={() => setChoice(p.id)}
                            disabled={ownActions.length > 0}
                        />
                        {p.nick}
                        <br />
                    </label>
                ))}
                <p>
                    <button onClick={() => onAction(choice)} disabled={ownActions.length > 0}>OK</button>
                </p>
            </>
        );
    } else {
        return (
            <>
                <p>
                    <strong>{playersInGame.find(p => p.id == ownActions[0])?.nick}</strong>'s card
                    was the <Tag card={revelations[0]} />. You now have that card, and they have
                    your <Tag card="robber" /> card.
                </p>
                <button onClick={() => onAction('')} disabled={ownActions.length > 1}>OK</button>
            </>
        );
    }
};

export default Robber;
