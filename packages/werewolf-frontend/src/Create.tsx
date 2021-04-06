import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';

import { Button, FormControl, Input, Link } from './ui';
import { backendBaseUrl } from './config';

export default function Create(): JSX.Element {
    const [gameId, setGameId] = useState(''),
        [playerId, setPlayerId] = useState(''),
        [didError, setDidError] = useState(false),
        [nick, setNick] = useState(''),
        [submitted, setSubmitted] = useState(false);

    async function createGame() {
        const response = await (await fetch(`${backendBaseUrl}/games/create?nick=${nick}`)).json();

        if (typeof response.gameId == 'string' && typeof response.key == 'string') {
            setGameId(response.gameId);
            setPlayerId(response.key);
        } else {
            setDidError(true);
            setSubmitted(false);
        }
    }

    useEffect(() => {
        if (nick.length > 0 && submitted) {
            createGame();
        }
    }, [submitted]);

    if (gameId && playerId) {
        return <Redirect to={`/${gameId}/${playerId}/play`} />;
    } else if (didError) {
            return (
                <>
                    <p>
                        Failed to create game.
                    </p>
                    <p>
                        <Link to="/">Back</Link>
                    </p>
                </>
            );
    } else if (submitted) {
        return <p>Creating game...</p>;
    } else {
        return (
            <form>
                <h1>Create game</h1>
                <FormControl>
                    <label htmlFor="nick">
                        Nickname:
                    </label>
                    <Input
                        id="nick"
                        value={nick}
                        onChange={e => setNick(e.target.value)}
                        disabled={submitted}
                    />
                </FormControl>
                <Button as="input" type="submit" value="Create game" onClick={() => setSubmitted(true)} disabled={nick.length == 0 || submitted} />
            </form>
        );
    }
}
