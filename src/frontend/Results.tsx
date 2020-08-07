import React from 'react';
import { observer } from 'mobx-react';

import { StoreProps, Player } from './WerewolfState';
import { Tag } from './ui';
import PlayerNameList from './PlayerNameList';

const Results = observer(({ store: { results, ownId, playersInGame } }: StoreProps) => {
    if (results === undefined) {
        return (
            <p>Waiting for server...</p>
        );
    } else {
        const winningTeamDisplay = {
            werewolves: (
                <>The <Tag card="werewolf">werewolves</Tag></>
            ),
            tanner: (
                <>The <Tag card="tanner" /></>
            ),
            villagers: 'The villagers',
            nobody: 'No one',
        }[results.winningTeam],
            winningPlayers = results.winners.map(id => playersInGame.find(p => p.id == id) as Player),
            executedPlayers = results.executed.map(id => playersInGame.find(p => p.id == id) as Player);


        return (
            <div className={`Results ${results.winners.includes(ownId) ? 'win' : 'lose'}`}>
                <h1>You {results.winners.includes(ownId) ? 'won' : 'lost'}!</h1>
                <p>
                    {winningTeamDisplay}&nbsp;
                    {results.winners.length > 0 && (
                        <>
                            (<PlayerNameList players={winningPlayers} ownId={ownId} />)&nbsp;
                        </>
                    )}
                    won.
                </p>
                <p>
                    {results.executed.length > 0 ? ( // TODO: maintain grammar
                        <>
                            <PlayerNameList players={executedPlayers} ownId={ownId} /> were executed.
                        </>
                    ): (
                        'Nobody was executed.'
                    )}
                </p>
                <div className="cards-reveal">
                    <div>
                        <h2>Initial cards:</h2>
                        <ul>
                            {playersInGame.map(p => (
                                <li key={p.id}>
                                    {p.nick}: <Tag card={results.initialCards[p.id]} />
                                </li>
                            ))}
                            <br />
                            <li>
                                Cards in center: {results.initialCenter.map((card, i) => (
                                    <React.Fragment key={i}><Tag card={card} /> </React.Fragment>
                                ))}
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h2>Final cards:</h2>
                        <ul>
                            {playersInGame.map(p => (
                                <li key={p.id}>
                                    {p.nick}: <Tag card={results.finalCards[p.id]} />
                                </li>
                            ))}
                            <br />
                            <li>
                                Cards in center: {results.finalCenter.map(card => (
                                    <><Tag card={card} /> </>
                                ))}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
});

export default Results;
