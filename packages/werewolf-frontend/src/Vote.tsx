import React, { useState } from 'react';
import { observer } from 'mobx-react';

import { Button, ButtonGroup, ToggleButton } from './ui';
import { StoreProps } from './WerewolfState';
import useSharedSocket from './use-shared-socket';

const Vote = observer(({ store }: StoreProps): JSX.Element => {
    const [choice, setChoice] = useState(''),
        [submitted, setSubmitted] = useState(false),
        [sendMessage] = useSharedSocket();

    function submitVote(noOne: boolean) {
        sendMessage(JSON.stringify({
            type: 'vote',
            vote: noOne ? '' : choice,
        }));
        setSubmitted(true);
    }

    return (
        <>
            <h1>Vote!</h1>
            <p>
                Vote for a player to be executed. You may vote not to execute anybody, but everyone
                else must do the same in order for no one to be executed.
            </p>
            <ButtonGroup wrap align="center">
                {store.playersInGame.map(p => (
                    <ToggleButton
                        key={p.id}
                        checked={choice == p.id}
                        onChange={() => setChoice(p.id)}
                    >
                        {p.nick}
                    </ToggleButton>
                ))}
            </ButtonGroup>
            <ButtonGroup align="center">
                <Button disabled={submitted} onClick={() => submitVote(true)} color="gray">
                    Vote for no one
                </Button>
                <Button disabled={choice == '' || submitted} onClick={() => submitVote(false)}>
                    Vote{choice != '' && ` for ${store.playersInGame.find(p => p.id == choice)!.nick}`}
                </Button>
            </ButtonGroup>
        </>
    );
});

export default Vote;
