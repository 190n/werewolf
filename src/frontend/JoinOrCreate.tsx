import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function JoinOrCreate(): JSX.Element {
    const [joinCode, setJoinCode] = useState('');
    const inputHandler = (e: React.ChangeEvent<HTMLInputElement>) => setJoinCode(e.target.value);

    return (
        <div className="JoinOrCreate">
            <h1>Werewolf</h1>
            <form>
                <p>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoFocus={true}
                        value={joinCode}
                        onChange={inputHandler}
                    />
                </p>
                <p>
                    <Link to={`/${joinCode}`}>
                        <input type="submit" value="Join Game" />
                    </Link>
                </p>
            </form>
            <br /><br />
            <p>
                Or, <Link to="/create">create a game</Link>
            </p>
        </div>
    );
}
