import React, { useState, useEffect } from 'react';
import { Link, Redirect, useParams } from 'react-router-dom';
import { observer } from 'mobx-react';

import { StoreProps } from './WerewolfState';

const Join = observer(({ store }: StoreProps): JSX.Element => {
    const { gameId } = useParams(),
        [nick, setNick] = useState(new URLSearchParams(location.search).get('nick')),
        [error, setError] = useState<string | undefined>(undefined),
        [submitted, setSubmitted] = useState(nick != null);

    async function tryJoinGame() {
        if (nick === null || !submitted) {
            return;
        }

        const response = await (await fetch(`http://localhost:5000/games/join?gameId=${gameId}&nick=${encodeURIComponent(nick)}`)).json();

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
            <div className="Join">
                <h1>Joining {gameId}...</h1>
                <p>
                    {error}
                </p>
                <p>
                    <Link to="/">Back</Link>
                </p>
                {store.ownId && <Redirect to={`/${gameId}/${store.ownId}/play`} />}
            </div>
        ) : (
            <div className="Join">
                <h1>Enter your nickname:</h1>
                <p>
                    <input
                        type="text"
                        value={typeof nick == 'string' ? nick : ''}
                        onChange={e => setNick(e.target.value)}
                    />
                </p>
                <button onClick={() => setSubmitted(true)}>Join</button>
                <p>
                    {error}
                </p>
            </div>
        )
    );
});

export default Join;
