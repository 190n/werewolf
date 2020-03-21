import React, { useState, useEffect } from 'react';
import { Link, Redirect, useParams } from 'react-router-dom';
import { observer } from 'mobx-react';

import { StoreProps } from './WerewolfState';

const Join = observer(({ store }: StoreProps): JSX.Element => {
    const { gameId } = useParams();

    const [error, setError] = useState<string | undefined>(undefined);

    async function joinGame() {
        const response = await (await fetch(`http://localhost:5000/games/${gameId}/join`)).json();

        if (response.error != null) {
            setError(response.error);
        } else {
            store.ownId = response.id;
        }
    }

    useEffect(() => { joinGame(); }, []);

    return (
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
    );
});

export default Join;
