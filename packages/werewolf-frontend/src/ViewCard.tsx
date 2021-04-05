import React, { useState } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { mix } from 'polished';

import { Button } from './ui';
import { StoreProps } from './WerewolfState';
import useSharedSocket from './use-shared-socket';
import { useColorMode } from './color-mode';

const CardReveal = styled.h1<{ card: string }>`
    color: ${props => {
        const { colorMode } = useColorMode();
        return mix(colorMode == 'light' ? 0.25 : 0.5, colorMode == 'light' ? '#000' : '#fff', props.theme.colors.cards[props.card])
    }};

    span {
        text-transform: capitalize;
    }
`;

const ViewCard = observer(({ store }: StoreProps): JSX.Element => {
    const [hasConfirmed, setHasConfirmed] = useState(false);
    const [sendMessage] = useSharedSocket();

    function confirm() {
        setHasConfirmed(true);
        sendMessage(JSON.stringify({
            type: 'confirmOwnCard',
        }));
    }

    return (
        <>
            {store.ownCard === undefined ? (
                <p>Waiting to be assigned a card...</p>
            ) : (
                <>
                    <CardReveal card={store.ownCard}>
                        You are the&nbsp;
                        <span>{store.ownCard}</span>
                    </CardReveal>
                    <br />
                    {hasConfirmed ? (
                        'Waiting for other players to confirm...'
                    ) : (
                        <Button onClick={confirm} big color={`cards.${store.ownCard}`}>OK</Button>
                    )}
                </>
            )}
        </>
    );
});

export default ViewCard;
