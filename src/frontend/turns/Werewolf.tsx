import React, { useState } from 'react';

import { Player } from '../WerewolfState';
import { TurnComponent } from '../Turn';

const Werewolf: TurnComponent = ({ players, revealed, onAction }): JSX.Element => {
    const otherWerewolves = revealed.split(',').map(id => players.find(p => p.id == id)).filter(p => p !== undefined) as Player[];

    if (otherWerewolves.length > 0) {
        if (otherWerewolves.length == 1) {
            return (
                <>
                    <p>
                        The other werewolf is <strong>{otherWerewolves[0].nick}</strong>.
                    </p>
                    <button onClick={() => onAction('')}>OK</button>
                </>
            );
        } else {
            return (
                <>
                    <p>
                        The other werewolves are <strong>{otherWerewolves[0].nick}</strong> and <strong>{otherWerewolves[1].nick}</strong>.
                    </p>
                    <button onClick={() => onAction('')}>OK</button>
                </>
            );
        }
    } else {
        const [selectedCard, setSelectedCard] = useState('');

        return (
            <>
                <p>
                    You are the only werewolf. Choose a card from the center to look at:
                </p>
                <p>
                    {['left', 'middle', 'right'].map(c => (
                        <label htmlFor={c} key={c}>
                            <input
                                type="radio"
                                name="cardFromCenter"
                                value={c}
                                id={c}
                                checked={selectedCard == c}
                                onChange={() => setSelectedCard(c)}
                            />
                            {c}
                        </label>
                    ))}
                </p>
                <button disabled={selectedCard == ''} onClick={() => (selectedCard != '' && onAction(selectedCard))}>
                    OK
                </button>
            </>
        );
    }
};

export default Werewolf;
