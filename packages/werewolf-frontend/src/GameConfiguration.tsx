import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Button, ButtonGroup, Input, ToggleButtonCapitalized, ButtonGroupProps } from './ui';
import { StoreProps } from './WerewolfState';
import useSharedSocket from './use-shared-socket';

const cards = [
    'werewolf',
    'doppelganger',
    'minion',
    'mason',
    'seer',
    'robber',
    'troublemaker',
    'drunk',
    'insomniac',
    'tanner',
    'hunter',
    'villager',
];

const selectables: { [key: string]: string[] } = {
    ...Object.fromEntries(cards.filter(c => !(['werewolf', 'doppelganger', 'mason', 'villager'].includes(c))).map(c => [c, [c]])),
    werewolves: ['werewolf', 'werewolf'],
    masons: ['mason', 'mason'],
    'villager 1': ['villager'],
    'villager 2': ['villager'],
    'villager 3': ['villager'],
    doppelgänger: ['doppelganger'],
};

const sortedKeys = Object.keys(selectables).sort((a, b) => cards.indexOf(selectables[a][0]) - cards.indexOf(selectables[b][0]));

function isSelected(cardsInPlay: string[], s: string): boolean {
    if (s.startsWith('villager')) {
        const numVillagersRepresented = parseInt(s.split(' ')[1]),
            numVillagersActual = cardsInPlay.reduce((count, card) => card == 'villager' ? count + 1 : count, 0);
        return numVillagersActual >= numVillagersRepresented;
    } else {
        return cardsInPlay.includes(selectables[s][0]);
    }
}

const FadingButtonGroup = styled(ButtonGroup)<ButtonGroupProps & { fade: boolean }>`
    input:not(:checked) + ${Button} {
        transition: 1s opacity;
        opacity: ${props => props.fade ? 0.25 : 1};
    }
`;

const GameConfiguration = observer(({ store }: StoreProps): JSX.Element => {
    let cardsFromLocalStorage: string[] = [];

    if (window.localStorage.getItem('lastSelectedCards') !== null) {
        const parsed = JSON.parse(window.localStorage.getItem('lastSelectedCards') as string);
        if (parsed instanceof Array) {
            cardsFromLocalStorage = parsed.filter(c => selectables.hasOwnProperty(c));
        }
    }

    const [selected, setSelected] = useState<string[]>(cardsFromLocalStorage),
        [isConfirming, setIsConfirming] = useState(false),
        [sendMessage] = useSharedSocket(),
        [discussionLengthMinutes, setDiscussionLengthMinutes] = useState(window.localStorage.getItem('lastDiscussionLength') ?? '5');

    useEffect(() => {
        window.localStorage.setItem('lastSelectedCards', JSON.stringify(selected));
    }, [selected]);

    useEffect(() => {
        window.localStorage.setItem('lastDiscussionLength', discussionLengthMinutes);
    }, [discussionLengthMinutes]);

    useEffect(() => {
        if (store.isLeader) {
            sendMessage(JSON.stringify({
                type: 'cardsInPlay',
                cardsInPlay: selected.map(s => selectables[s]).flat(1),
            }));
        }
    }, []);

    if (store.isLeader) {
        function sendCards(newCards: string[], final: boolean = false) {
            sendMessage(JSON.stringify({
                type: final ? 'confirmCards' : 'cardsInPlay',
                cardsInPlay: newCards.map(s => selectables[s]).flat(1),
                discussionLength: parseInt(discussionLengthMinutes) * 60,
            }));
        }

        function selectAll() {
            setSelected(sortedKeys);
            sendCards(sortedKeys);
        }

        function selectNone() {
            setSelected([]);
            sendCards([]);
        }

        function onToggle(s: string) {
            const newCards = selected.includes(s)
                ? selected.filter(i => i != s)
                : [...selected, s];
            setSelected(newCards);
            sendCards(newCards);
        }

        const numSelected = selected.reduce((prev: number, s: string) => prev + selectables[s].length, 0),
            numExpected = store.playerIdsInGame.length + 3;

        return (
            <>
                <h1>{isConfirming ? 'Confirm card selection' : 'Choose cards'}</h1>
                <FadingButtonGroup wrap align="center" fade={isConfirming}>
                    {sortedKeys.map(s => (
                        <ToggleButtonCapitalized
                            color={`cards.${selectables[s][0]}`}
                            checked={selected.includes(s)}
                            onChange={onToggle.bind(null, s)}
                            disabled={isConfirming}
                            big
                            key={s}
                        >
                            {s}
                        </ToggleButtonCapitalized>
                    ))}
                </FadingButtonGroup>
                <ButtonGroup align="center">
                    {isConfirming || (
                        <>
                            <Button onClick={selectAll}>
                                Select all
                            </Button>
                            <Button onClick={selectNone} color="gray">
                                Select none
                            </Button>
                        </>
                    )}
                </ButtonGroup>
                <p>
                    Select {numExpected} cards for a game with {store.playerIdsInGame.length} players.
                </p>
                <p>
                    <label htmlFor="discussionLength">
                        Discussion length:&nbsp;
                        <Input
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={discussionLengthMinutes}
                            onChange={e => setDiscussionLengthMinutes(e.target.value)}
                            id="discussionLength"
                            inline
                            width="4ch"
                            disabled={isConfirming}
                        />
                        &nbsp; minutes
                    </label>
                </p>
                <div>
                    {numSelected == numExpected ? (
                        Number.isNaN(parseInt(discussionLengthMinutes)) ? (
                            'Enter the length of the discussion'
                        ) : (
                            <ButtonGroup align="center">
                                {isConfirming ? (
                                    <>
                                        <Button onClick={() => sendCards(selected, true)}>Confirm</Button>
                                        <Button onClick={() => setIsConfirming(false)} color="gray">Cancel</Button>
                                    </>
                                ) : (
                                    <Button onClick={() => setIsConfirming(true)}>Start game</Button>
                                )}
                            </ButtonGroup>
                        )
                    ) : (
                        `Select ${Math.abs(numSelected - numExpected)}
                        ${numSelected > numExpected ? 'fewer' : 'more'}
                        ${Math.abs(numSelected - numExpected) == 1 ? 'card' : 'cards'}
                        to start.`
                    )}
                </div>
            </>
        );
    } else {
        return (
            <>
                <h1>Leader is choosing cards</h1>
                <ButtonGroup wrap align="center">
                    {sortedKeys.map(s => (
                        <ToggleButtonCapitalized
                            color={`cards.${selectables[s][0]}`}
                            checked={isSelected(store.cardsInPlay, s)}
                            disabled
                            big
                            key={s}
                        >
                            {s}
                        </ToggleButtonCapitalized>
                    ))}
                </ButtonGroup>
            </>
        );
    }
});

export default GameConfiguration;
