import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, FormControl, FormLabel, Heading, Input, Stack, Text } from '@chakra-ui/core';

import Link from './Link';

export default function JoinOrCreate(): JSX.Element {
    const [joinCode, setJoinCode] = useState(''),
        [nick, setNick] = useState('');

    return (
        <Stack spacing={8} p={8} align="center">
            <Heading>Werewolf</Heading>
            <form>
                <FormControl>
                    <FormLabel htmlFor="joinCode">
                        Join code
                    </FormLabel>
                    <Input
                        id="joinCode"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        autoFocus={true}
                        value={joinCode}
                        onChange={e => setJoinCode(e.target.value)}
                    />
                </FormControl>
                <FormControl mt={4}>
                    <FormLabel htmlFor="nick">
                        Nickname
                    </FormLabel>
                    <Input
                        id="nick"
                        type="text"
                        value={nick}
                        onChange={e => setNick(e.target.value)}
                    />
                </FormControl>
                <RouterLink to={`/${joinCode}?nick=${encodeURIComponent(nick)}`}>
                    <Button
                        type="submit"
                        isDisabled={joinCode.length < 6 || nick.length == 0}
                        variantColor="blue"
                        mt={4}
                        w="100%"
                    >
                        Join Game
                    </Button>
                </RouterLink>
            </form>
            <Text mt={4}>
                Or, <Link to="/create">create a game</Link>
            </Text>
        </Stack>
    );
}
