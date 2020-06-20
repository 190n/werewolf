import React, { useState } from 'react';
import { observer } from 'mobx-react';
import { BoxProps, ControlBox, Flex, Heading, Text, VisuallyHidden } from '@chakra-ui/core';

import { StoreProps } from './WerewolfState';
import useSharedSocket from './use-shared-socket';
import { cards } from '../lib/cards';

const selectables: { [key: string]: string[] } = {
    ...Object.fromEntries(cards.filter(c => c != 'werewolf' && c != 'mason' && c != 'villager').map(c => [c, [c]])),
    werewolves: ['werewolf', 'werewolf'],
    masons: ['mason', 'mason'],
    'villager 1': ['villager'],
    'villager 2': ['villager'],
    'villager 3': ['villager'],
};

const sortedKeys = Object.keys(selectables).sort((a, b) => cards.indexOf(selectables[a][0]) - cards.indexOf(selectables[b][0]));

interface SelectableCardProps {
    name: string;
    role: string;
    onToggle?: () => void;
    selected?: boolean;
    disabled?: boolean;
};

const SelectableCard = ({
    name,
    role,
    onToggle = () => {},
    selected = false,
    disabled = false
}: SelectableCardProps): JSX.Element => (
    <label>
        {React.createElement(
            VisuallyHidden as React.FC<BoxProps & { type: string, checked: boolean }>,
            { as: 'input', type: 'checkbox', checked: selected, onChange: onToggle },
            null
        )}
        <ControlBox
            border="2px"
            borderColor={role}
            p={2}
            m={1}
            borderRadius="md"
            textTransform="capitalize"
            cursor={disabled ? 'default' : 'pointer'}
        >
            {name}
        </ControlBox>
    </label>
);


const GameConfiguration = observer(({ store }: StoreProps): JSX.Element => {
    const [selected, setSelected] = useState<string[]>([]),
        [isConfirming, setIsConfirming] = useState(false),
        [sendMessage] = useSharedSocket(),
        [discussionLengthMinutes, setDiscussionLengthMinutes] = useState('5');

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
                <Heading mb={4}>{isConfirming ? 'Confirm card selection' : 'Choose cards'}</Heading>
                <Flex wrap="wrap" w="100%" maxWidth="lg" justifyContent="center">
                    {sortedKeys.map(s => (
                        <SelectableCard
                            name={s}
                            role={selectables[s][0]}
                            onToggle={isConfirming ? () => {} : onToggle.bind(null, s)}
                            selected={selected.includes(s)}
                            disabled={isConfirming}
                            key={s}
                        />
                    ))}
                </Flex>
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
                    <label htmlFor="discussionLength">
                        Discussion length:&nbsp;
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            size={2}
                            value={discussionLengthMinutes}
                            onChange={e => setDiscussionLengthMinutes(e.target.value)}
                            id="discussionLength"
                        />
                        &nbsp; minutes
                    </label>
                </p>
                <p>
                    {numSelected == numExpected ? (
                        Number.isNaN(parseInt(discussionLengthMinutes)) ? (
                            'Enter the length of the discussion'
                        ) : (
                            isConfirming ? (
                                <>
                                    <button onClick={() => sendCards(selected, true)}>Confirm</button>
                                    <button onClick={() => setIsConfirming(false)}>Cancel</button>
                                </>
                            ) : (
                                <button onClick={() => setIsConfirming(true)}>Start game</button>
                            )
                        )
                    ) : (
                        `Select ${Math.abs(numSelected - numExpected)}
                        ${numSelected > numExpected ? 'fewer' : 'more'}
                        ${Math.abs(numSelected - numExpected) == 1 ? 'card' : 'cards'}
                        to start.`
                    )}
                </p>
            </>
        );
    } else {
        return (
            <div className="GameConfiguration">
                <h1>Leader is choosing cards</h1>
                <Flex wrap="wrap" w="100%" maxWidth="lg" justifyContent="center">
                    {sortedKeys.map(s => (
                        <SelectableCard
                            name={s}
                            role={selectables[s][0]}
                            selected={store.cardsInPlay.includes(selectables[s][0])}
                            disabled={true}
                            key={s}
                        />
                    ))}
                </Flex>
            </div>
        );
    }
});

export default GameConfiguration;
