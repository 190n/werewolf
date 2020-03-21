import React, { useEffect, useState } from 'react';
import { Redirect, Link } from 'react-router-dom';

export default function Create(): JSX.Element {
    const [gameId, setGameId] = useState('');
    const [playerId, setPlayerId] = useState('');
    const [didError, setDidError] = useState(false);

    async function createGame() {
        const response = await (await fetch('http://localhost:5000/games/create')).json();

        if (typeof response.gameId == 'string' && typeof response.key == 'string') {
            setGameId(response.gameId);
            setPlayerId(response.key);
        } else {
            setDidError(true);
        }
    }

    useEffect(() => {
        createGame();
    }, []);

    if (gameId && playerId) {
        return <Redirect to={`/${gameId}/${playerId}/play`} />;
    } else {
        if (didError) {
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
        } else {
            return <p>Creating game...</p>;
        }
    }
}
