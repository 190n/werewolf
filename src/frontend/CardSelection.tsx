import React, { useState, useMemo } from 'react';
import { observer } from 'mobx-react';
import { Set } from 'immutable';

import { StoreProps } from './WerewolfState';
import useSharedSocket from './use-shared-socket';
import { cards } from '../lib/cards';

// TODO: allow multiple villagers
// selectables are probably "Villager 1", "Villager 2", "Villager 3"
// or fancier UI for how many you want
const selectables: { [key: string]: string[] } = {
    ...Object.fromEntries(cards.filter(c => c != 'werewolf' && c != 'mason').map(c => [c, [c]])),
    werewolves: ['werewolf', 'werewolf'],
    masons: ['mason', 'mason'],
};

interface SelectableCardProps {
    name: string;
    className: string;
    onToggle?: () => void;
    selected?: boolean;
    disabled?: boolean;
};

const SelectableCard = ({
    name,
    className,
    onToggle = () => {},
    selected = false,
    disabled = false
}: SelectableCardProps): JSX.Element => (
    <div className={`SelectableCard ${className}${selected ? ' selected' : ''}${disabled ? ' disabled' : ''}`} onClick={onToggle}>
        {name}
    </div>
);


const CardSelection = observer(({ store }: StoreProps): JSX.Element => {
    const sortedKeys = useMemo(() => Object.keys(selectables).sort((a, b) => cards.indexOf(selectables[a][0]) - cards.indexOf(selectables[b][0])), []);

    if (store.isLeader) {
        const [selected, setSelected] = useState(Set<string>());
        const [isConfirming, setIsConfirming] = useState(false);
        const [sendMessage] = useSharedSocket();

        function sendCards(newCards: Set<string>, final: boolean = false) {
            sendMessage(JSON.stringify({
                type: final ? 'confirmCards' : 'cardsInPlay',
                cardsInPlay: newCards.toArray().map(s => selectables[s]).flat(1),
            }));
        }

        function selectAll() {
            const newCards = Set<string>(sortedKeys);
            setSelected(newCards);
            sendCards(newCards);
        }

        function selectNone() {
            const newCards = Set<string>();
            setSelected(newCards);
            sendCards(newCards);
        }

        function onToggle(s: string) {
            const newCards = selected.has(s) ? selected.delete(s) : selected.add(s);
            setSelected(newCards);
            sendCards(newCards);
        }

        const numSelected = selected.reduce((prev: number, s: string) => prev + selectables[s].length, 0),
            numExpected = store.playerIdsInGame.length + 3;

        return (
            <div className={isConfirming ? 'CardSelection confirm' : 'CardSelection'}>
                <h1>{isConfirming ? 'Confirm card selection' : 'Choose cards'}</h1>
                {sortedKeys.map(s => (
                    <SelectableCard
                        name={s}
                        className={selectables[s][0]}
                        onToggle={isConfirming ? () => {} : onToggle.bind(null, s)}
                        selected={selected.has(s)}
                        disabled={isConfirming}
                        key={s}
                    />
                ))}
                <p>
                    {isConfirming ? <span>&nbsp;</span> : (
                        <>
                            <button onClick={selectAll}>
                                Select All
                            </button>
                            <button onClick={selectNone}>
                                Select None
                            </button>
                        </>
                    )}
                </p>
                <p>
                    Select {numExpected} cards for a game with {store.playerIdsInGame.length} players.
                </p>
                <p>
                    {numSelected == numExpected ? (
                        isConfirming ? (
                            <>
                                <button onClick={() => sendCards(selected, true)}>Confirm</button>
                                <button onClick={() => setIsConfirming(false)}>Cancel</button>
                            </>
                        ) : (
                            <button onClick={() => setIsConfirming(true)}>Start game</button>
                        )
                    ) : (
                        `Select ${Math.abs(numSelected - numExpected)}
                        ${numSelected > numExpected ? 'fewer' : 'more'}
                        ${Math.abs(numSelected - numExpected) == 1 ? 'card' : 'cards'}
                        to start.`
                    )}
                </p>
            </div>
        );
    } else {
        return (
            <div className="CardSelection">
                <h1>Leader is choosing cards</h1>
                {sortedKeys.map(s => (
                    <SelectableCard
                        name={s}
                        className={selectables[s][0]}
                        selected={store.cardsInPlay.includes(selectables[s][0])}
                        disabled={true}
                        key={s}
                    />
                ))}
            </div>
        );
    }
});

export default CardSelection;
