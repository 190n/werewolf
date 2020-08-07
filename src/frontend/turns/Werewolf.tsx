import React, { useState } from 'react';
import { observer } from 'mobx-react';

import { Button, ButtonGroup, Tag, ToggleButtonCapitalized } from '../ui';
import { TurnComponent } from '../Turn';
import { getPlayersFromRevelation } from '../util';
import PlayerNameList from '../PlayerNameList';

const Werewolf: TurnComponent = observer(({ store: { playersInGame, revelations }, onAction }) => {
    const [selectedCard, setSelectedCard] = useState(-1);

    if (revelations.length == 0) {
        return (
            <p>
                Waiting for server...
            </p>
        );
    } else if (revelations.length == 1) {
        const otherWerewolves = getPlayersFromRevelation(revelations[0], playersInGame);

        if (otherWerewolves.length > 0) {
            let message: JSX.Element;

            if (otherWerewolves.length == 1) {
                message = (
                    <p>
                        The other <Tag card="werewolf" /> is <strong>{otherWerewolves[0].nick}</strong>.
                    </p>
                );
            } else {
                message = (
                    <p>
                        The other <Tag card="werewolf">werewolves</Tag> are <PlayerNameList players={otherWerewolves} />.
                    </p>
                );
            }

            return (
                <>
                    {message}
                    <Button onClick={() => onAction('')}>OK</Button>
                </>
            );
        } else {
            return (
                <>
                    <p>
                        You are the only <Tag card="werewolf" />. Choose a card from the center to look at:
                    </p>
                    <ButtonGroup align="center">
                        {['left', 'middle', 'right'].map((c, i) => (
                            <ToggleButtonCapitalized
                                checked={selectedCard == i}
                                onChange={() => setSelectedCard(i)}
                            >
                                {c}
                            </ToggleButtonCapitalized>
                        ))}
                    </ButtonGroup>
                    <Button disabled={selectedCard == -1} onClick={() => (selectedCard != -1 && onAction(selectedCard.toString()))}>
                        OK
                    </Button>
                </>
            );
        }
    } else {
        // we learned which card is in the center
        return (
            <>
                <p>
                    That card was the <Tag card={revelations[1]} />.
                </p>
                <Button onClick={() => onAction('')}>OK</Button>
            </>
        );
    }
});

export default Werewolf;
