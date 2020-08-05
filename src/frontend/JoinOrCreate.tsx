import React, { useState } from 'react';
import { Button, FlexibleContainer, FormControl, Input, Link } from './ui';

export default function JoinOrCreate(): JSX.Element {
    const [joinCode, setJoinCode] = useState(''),
        [nick, setNick] = useState('');

    return (
        <>
            <h1>Werewolf</h1>
            <form>
                <FormControl>
                    <label htmlFor="joinCode">
                        Join code:
                    </label>
                    <Input
                        id="joinCode"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        autoFocus={true}
                        value={joinCode}
                        onChange={e => setJoinCode(e.target.value)}
                    />
                </FormControl>
                <FormControl>
                    <label htmlFor="nick">
                        Nickname:
                    </label>
                    <Input
                        id="nick"
                        value={nick}
                        onChange={e => setNick(e.target.value)}
                    />
                </FormControl>
                <p>
                    <Link to={`/${joinCode}?nick=${encodeURIComponent(nick)}`}>
                        <Button as="input" type="submit" value="Join Game" disabled={joinCode.length < 6 || nick.length == 0} />
                    </Link>
                </p>
            </form>
            <p>
                Or, <Link to="/create">create a game</Link>
            </p>
        </>
    );
}
