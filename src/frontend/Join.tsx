import React, { useState, useEffect } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Box,Button, FormControl, FormLabel, Heading, Input, Text } from '@chakra-ui/core';

import Link from './Link';
import { StoreProps } from './WerewolfState';
import { backendBaseUrl } from './config';

const Join = observer(({ store }: StoreProps): JSX.Element => {
    const { gameId } = useParams(),
        [nick, setNick] = useState(new URLSearchParams(location.search).get('nick')),
        [error, setError] = useState<string | undefined>(undefined),
        [submitted, setSubmitted] = useState(nick !== null);

    async function tryJoinGame() {
        if (nick === null || !submitted) {
            return;
        }

        const response = await (await fetch(`${backendBaseUrl}/games/join?gameId=${gameId}&nick=${encodeURIComponent(nick)}`)).json();

        if (response.error != null) {
            setError(response.error);
            setSubmitted(false);
        } else {
            store.ownId = response.id;
        }
    }

    useEffect(() => { tryJoinGame(); }, [submitted]);

    return (
        submitted ? (
            <>
                <Heading>Joining {gameId}...</Heading>
                <Text>
                    {error}
                </Text>
                <Text>
                    <Link to="/">Back</Link>
                </Text>
                {store.ownId && <Redirect to={`/${gameId}/${store.ownId}/play`} />}
            </>
        ) : (
            <>
                <Heading mb={4}>Join game {gameId}</Heading>
                <form>
                    <FormControl mb={4}>
                        <FormLabel htmlFor="nick">
                            Nickname
                        </FormLabel>
                        <Input
                            id="nick"
                            type="text"
                            value={typeof nick == 'string' ? nick : ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNick(e.target.value)}
                        />
                    </FormControl>
                    <Button
                        onClick={() => setSubmitted(true)}
                        isDisabled={nick == ''}
                        variantColor="blue"
                        type="submit"
                        w="100%"
                    >
                        Join
                    </Button>
                </form>
                <Text mt={4} color="red.700">
                    {error}
                </Text>
            </>
        )
    );
});

export default Join;
