import React, { useState, useEffect } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { observer } from 'mobx-react';

import { Button, FormControl, Input, Link } from './ui';
import { StoreProps } from './WerewolfState';
import { backendBaseUrl } from './config';

const Join = observer(({ store }: StoreProps): JSX.Element => {
    const { gameId } = useParams(),
        [nick, setNick] = useState(new URLSearchParams(location.search).get('nick')),
        [error, setError] = useState<string | undefined>(undefined),
        [submitted, setSubmitted] = useState(nick != null);

    async function tryJoinGame() {
        if (nick === null || !submitted) {
            return;
        }

        const response = await (await fetch(`${backendBaseUrl}/games/join?gameId=${gameId}&nick=${encodeURIComponent(nick)}`)).json();

        if (response.error != null) {
            setError(response.error);
            setSubmitted(false);
        } else {
            store.ownId = response.id;
        }
    }

    useEffect(() => { tryJoinGame(); }, [submitted]);

    return (
        submitted ? (
            <>
                <h1>Joining {gameId}...</h1>
                <p>
                    {error}
                </p>
                <p>
                    <Link to="/">Back</Link>
                </p>
                {store.ownId && <Redirect to={`/${gameId}/${store.ownId}/play`} />}
            </>
        ) : (
            <form>
                <h1>Enter your nickname:</h1>
                <FormControl>
                    <Input
                        value={typeof nick == 'string' ? nick : ''}
                        onChange={e => setNick(e.target.value)}
                        autoFocus={true}
                    />
                </FormControl>
                <Button as="input" type="submit" value="Join" onClick={() => setSubmitted(true)} wide={true} />
                <p>
                    {error}
                </p>
            </form>
        )
    );
});

export default Join;
