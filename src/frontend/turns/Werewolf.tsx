import React, { useState } from 'react';
import { observer } from 'mobx-react';

import { Player } from '../WerewolfState';
import { TurnComponent } from '../Turn';

const Werewolf: TurnComponent = observer(({ players, revelations, onAction }) => {
    if (revelations.length == 0) {
        return (
            <p>
                Waiting for server...
            </p>
        );
    } else if (revelations.length == 1) {
        const otherWerewolves = revelations[0].split(',').map(id => players.find(p => p.id == id)).filter(p => p !== undefined) as Player[];

        if (otherWerewolves.length > 0) {
            if (otherWerewolves.length == 1) {
                return (
                    <>
                        <p>
                            The other <span className="tag werewolf">Werewolf</span> is <strong>{otherWerewolves[0].nick}</strong>.
                        </p>
                        <button onClick={() => onAction('')}>OK</button>
                    </>
                );
            } else {
                return (
                    <>
                        <p>
                            The other <span className="tag werewolf">Werewolves</span> are <strong>{otherWerewolves[0].nick}</strong> and <strong>{otherWerewolves[1].nick}</strong>.
                        </p>
                        <button onClick={() => onAction('')}>OK</button>
                    </>
                );
            }
        } else {
            const [selectedCard, setSelectedCard] = useState(-1);

            return (
                <>
                    <p>
                        You are the only <span className="tag werewolf">Werewolf</span>. Choose a card from the center to look at:
                    </p>
                    <p>
                        {['left', 'middle', 'right'].map((c, i) => (
                            <label htmlFor={c} key={c}>
                                <input
                                    type="radio"
                                    name="cardFromCenter"
                                    value={i}
                                    id={c}
                                    checked={selectedCard == i}
                                    onChange={() => setSelectedCard(i)}
                                />
                                {c}
                            </label>
                        ))}
                    </p>
                    <button disabled={selectedCard == -1} onClick={() => (selectedCard != -1 && onAction(selectedCard.toString()))}>
                        OK
                    </button>
                </>
            );
        }
    } else {
        // we learned which card is in the center
        return <p>not implemented</p>;
    }
});

export default Werewolf;
