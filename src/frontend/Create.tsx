import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Button, FormControl, FormLabel, Heading, Input, Text } from '@chakra-ui/core';

import Link from './Link';
import { backendBaseUrl } from './config';

export default function Create(): JSX.Element {
    const [gameId, setGameId] = useState(''),
        [playerId, setPlayerId] = useState(''),
        [didError, setDidError] = useState(false),
        [nick, setNick] = useState(''),
        [submitted, setSubmitted] = useState(false);

    async function createGame() {
        const response = await (await fetch(`${backendBaseUrl}/games/create?nick=${nick}`)).json();

        if (typeof response.gameId == 'string' && typeof response.key == 'string') {
            setGameId(response.gameId);
            setPlayerId(response.key);
        } else {
            setDidError(true);
            setSubmitted(false);
        }
    }

    useEffect(() => {
        if (nick.length > 0 && submitted) {
            createGame();
        }
    }, [submitted]);

    if (gameId && playerId) {
        return <Redirect to={`/${gameId}/${playerId}/play`} />;
    } else if (didError) {
            return (
                <>
                    <Text>
                        Failed to create game.
                    </Text>
                    <Text>
                        <Link to="/">Back</Link>
                    </Text>
                </>
            );
    } else if (submitted) {
        return <Text>Creating game...</Text>;
    } else {
        return (
            <>
                <Heading mb={4}>Create game</Heading>
                <form>
                    <FormControl mb={4}>
                        <FormLabel htmlFor="nick">
                            Nickname
                        </FormLabel>
                        <Input
                            id="nick"
                            type="text"
                            value={nick}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNick(e.target.value)}
                            isDisabled={submitted}
                        />
                    </FormControl>
                    <Button
                        onClick={() => setSubmitted(true)}
                        isDisabled={nick.length == 0 || submitted}
                        variantColor="blue"
                        type="submit"
                        w="100%"
                    >
                        Create game
                    </Button>
                </form>
            </>
        );
    }
}
