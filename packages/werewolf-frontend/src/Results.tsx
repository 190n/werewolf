import React, { useState } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Button, Tag } from './ui';
import { GameResults, StoreProps, Player } from './WerewolfState';
import PlayerNameList from './PlayerNameList';

function getPlayerName(playerId: string, playersInGame: Player[]): string {
    return playersInGame.find(p => p.id == playerId)!.nick!;
}

const CenteredList = styled.ul`
    display: inline-flex;
    flex-direction: column;
    align-items: stretch;
    align-content: center;
    margin: 0;

    li {
        text-align: left;
    }
`;

const Row = styled.div`
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
`;

interface CardDisplayProps {
    cards: { [id: string]: string };
    center: [string, string, string];
    playersInGame: Player[];
}

const CardDisplay = ({ cards, center, playersInGame }: CardDisplayProps): JSX.Element => (
    <div>
        <CenteredList>
            {playersInGame.map(p => (
                <li key={p.id}>
                    {p.nick}: <Tag card={cards[p.id]} />
                </li>
            ))}
        </CenteredList>
        <p>
            Cards in center:<br />
            {center.map((card, i) => (
                <React.Fragment key={i}><Tag card={card} /> </React.Fragment>
            ))}
        </p>
    </div>
);

interface SwapDisplayProps {
    results: GameResults;
    playersInGame: Player[];
}

function SwapDisplay({ results: { initialCards, initialCenter, swaps }, playersInGame }: SwapDisplayProps): JSX.Element {
    function renderCardOwner(whichCard: string | number, swapper: string): React.ReactNode {
        if (whichCard == swapper) {
            return 'their own card';
        } else if (typeof whichCard == 'string') {
            return (
                <>
                    <strong>{getPlayerName(whichCard, playersInGame)}</strong>'s card
                </>
            );
        } else {
            return (
                <>
                    the <strong>{['leftmost', 'middle', 'rightmost'][whichCard]}</strong> card from the center
                </>
            );
        }
    }

    const movedCards = { ...initialCards },
        newCenter = [...initialCenter] as [string, string, string],
        listItems = [] as JSX.Element[];

    const sortedSwaps = [...swaps].sort((s1, s2) => s1[3] - s2[3]);
    for (const [player, card1, card2] of sortedSwaps) {
        const orig1 = (typeof card1 == 'string' ? movedCards[card1] : newCenter[card1]),
            orig2 = (typeof card2 == 'string' ? movedCards[card2] : newCenter[card2]);

        console.log(`switching ${card1} (${orig1}) with ${card2} (${orig2})`);

        if (typeof card1 == 'string') {
            movedCards[card1] = orig2;
        } else {
            newCenter[card1] = orig2;
        }

        if (typeof card2 == 'string') {
            movedCards[card2] = orig1;
        } else {
            newCenter[card2] = orig1;
        }

        listItems.push(
            <li key={player}>
                <strong>{getPlayerName(player, playersInGame)}</strong> (as <Tag card={initialCards[player]} />)
                swapped {renderCardOwner(card1, player)} (<Tag card={orig1} />)
                with {renderCardOwner(card2, player)} (<Tag card={orig2} />).
            </li>
        );
    }

    return (<CenteredList as="ol">{listItems}</CenteredList>);
}

const Results = observer(({ store: { results, ownId, playersInGame } }: StoreProps) => {
    const [viewingFinalCards, setViewingFinalCards] = useState(true);

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
            <>
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
                            <PlayerNameList players={executedPlayers} ownId={ownId} />
                            {(executedPlayers.length == 1 && executedPlayers[0].id != ownId) ? ' was ' : ' were '}
                            executed.
                        </>
                    ): (
                        'Nobody was executed.'
                    )}
                </p>
                <Row>
                    <div>
                        <h2>
                            {viewingFinalCards ? 'Final' : 'Initial'} cards:
                        </h2>
                        <CardDisplay
                            cards={viewingFinalCards ? results.finalCards : results.initialCards}
                            center={viewingFinalCards ? results.finalCenter : results.initialCenter}
                            playersInGame={playersInGame}
                        />
                        <Button onClick={() => setViewingFinalCards(!viewingFinalCards)}>
                            View {viewingFinalCards ? 'initial' : 'final'} cards
                        </Button>
                    </div>
                    <div>
                        <h2>Votes:</h2>
                        <CenteredList>
                            {Object.entries(results.votes).map(([player, vote]) => (
                                <li key={player}>
                                    <strong>{getPlayerName(player, playersInGame)}</strong> voted for&nbsp;
                                    {vote == '' ? 'no one' : <strong>{getPlayerName(vote, playersInGame)}</strong>}.
                                </li>
                            ))}
                        </CenteredList>
                    </div>
                </Row><br />
                <h2>Card swaps:</h2>
                <SwapDisplay results={results} playersInGame={playersInGame} />
            </>
        );
    }
});

export default Results;
