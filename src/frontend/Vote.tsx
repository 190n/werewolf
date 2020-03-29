import React, { useState } from 'react';
import { observer } from 'mobx-react';

import { StoreProps } from './WerewolfState';
import useSharedSocket from './use-shared-socket';

const Vote = observer(({ store }: StoreProps): JSX.Element => {
    const [choice, setChoice] = useState('$'),
        [submitted, setSubmitted] = useState(false),
        [sendMessage] = useSharedSocket();

    function submitVote() {
        sendMessage(JSON.stringify({
            type: 'vote',
            vote: choice,
        }));
        setSubmitted(true);
    }

    return (
        <>
            <h1>Vote!</h1>
            <p>
                Vote for a player to be executed. You can vote not to execute anybody, but everyone
                else must do the same in order for no one to be executed.
            </p>
            {store.playersInGame.map(p => (
                <label htmlFor={p.id} key={p.id}>
                    <input
                        type="radio"
                        id={p.id}
                        name="choice"
                        checked={choice == p.id}
                        onChange={() => setChoice(p.id)}
                    />
                    {p.nick}
                    <br />
                </label>
            ))}
            <br />
            <label htmlFor="no-one">
                <input
                    type="radio"
                    id="no-one"
                    name="choice"
                    checked={choice == ''}
                    onChange={() => setChoice('')}
                />
                No one (vote for the center)
            </label>
            <p>
                <button disabled={choice == '$' || submitted} onClick={submitVote}>Vote</button>
            </p>
        </>
    );
});

export default Vote;
