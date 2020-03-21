import React from 'react';
import { observer } from 'mobx-react';

import { StoreProps } from './WerewolfState';
import PlayerList from './PlayerList';
import SetNickname from './SetNickname';
import useSharedSocket from './use-shared-socket';

const Lobby = observer(({ store }: StoreProps): JSX.Element => {
    const [sendMessage] = useSharedSocket();

    function goToCardSelection() {
        console.log('about to send:');
        console.dir({
            type: 'toCardSelection',
            players: store.players.map(p => p.id),
        });
        sendMessage(JSON.stringify({
            type: 'toCardSelection',
            players: store.players.map(p => p.id),
        }));
    }

    return (
        <div className="Lobby">
            <h1>Lobby</h1>
            <p>
                Join code: {store.gameId}
            </p>
            <p>
                Link to join: <a href={`http://localhost:1234/${store.gameId}`}>http://localhost:1234/{store.gameId}</a>
            </p>
            <PlayerList store={store} />
            {store.isLeader && (
                store.players.length >= 4 ? (
                    <button onClick={goToCardSelection}>
                        Start game with {store.players.length} players
                    </button>
                ) : (
                    <p>
                        {store.players.length == 3 ? (
                            'One more player is needed to start the game.'
                        ) : (
                            `${4 - store.players.length} more players are needed to start the game.`
                        )}
                    </p>
                )
            )}
            <SetNickname store={store} />
        </div>
    );
});

export default Lobby;
