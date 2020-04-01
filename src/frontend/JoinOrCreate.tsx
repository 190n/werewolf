import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function JoinOrCreate(): JSX.Element {
    const [joinCode, setJoinCode] = useState(''),
        [nick, setNick] = useState('');

    return (
        <div className="JoinOrCreate">
            <h1>Werewolf</h1>
            <form>
                <p>
                    <label htmlFor="joinCode">
                        Join code:&nbsp;
                        <input
                            id="joinCode"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            autoFocus={true}
                            value={joinCode}
                            onChange={e => setJoinCode(e.target.value)}
                        />
                    </label>
                </p>
                <p>
                    <label htmlFor="nick">
                        Nickname:&nbsp;
                        <input
                            id="nick"
                            type="text"
                            value={nick}
                            onChange={e => setNick(e.target.value)}
                        />
                    </label>
                </p>
                <p>
                    <Link to={`/${joinCode}?nick=${encodeURIComponent(nick)}`}>
                        <input type="submit" value="Join Game" disabled={joinCode.length < 6 || nick.length == 0} />
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
