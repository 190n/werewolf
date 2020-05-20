import React, { useEffect } from 'react';
import { observer } from 'mobx-react';
import { Button, FormControl, FormLabel, Heading, Input, InputGroup, InputRightElement, Text, useClipboard, useToast } from '@chakra-ui/core';

import Link from './Link';
import { StoreProps } from './WerewolfState';
import PlayerList from './PlayerList';
import SetNickname from './SetNickname';
import useSharedSocket from './use-shared-socket';
import { frontendBaseUrl } from './config';

const Lobby = observer(({ store }: StoreProps): JSX.Element => {
    const [sendMessage] = useSharedSocket();
    const joinUrl = `${frontendBaseUrl}/${store.gameId}`;
    const { onCopy, hasCopied } = useClipboard(joinUrl);
    const toast = useToast();
    useEffect(() => {
        if (hasCopied) {
            toast({
                title: 'Copied link to clipboard',
                duration: 2000,
            });
        }
    }, [hasCopied]);

    function goToCardSelection() {
        console.log('about to send:');
        console.dir({
            type: 'toCardSelection',
            players: store.players.map(p => p.id),
        });
        sendMessage(JSON.stringify({
            type: 'toCardSelection',
            players: store.players.map(p => p.id),
        }));
    }

    return (
        <>
            <Heading mb={4}>Lobby</Heading>
            <Text>
                Join code: {store.gameId}
            </Text>
            <FormControl>
                <FormLabel htmlFor="join-link">
                    Link to join
                </FormLabel>
                <InputGroup>
                    <Input
                        id="join-link"
                        type="text"
                        value={joinUrl}
                        isReadOnly
                        pr="4rem"
                    />
                    <InputRightElement w="4rem" pr={1}>
                        <Button size="sm" w="100%" onClick={onCopy}>Copy</Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <PlayerList store={store} />
            {store.isLeader && (
                store.players.length >= 4 ? (
                    <button onClick={goToCardSelection}>
                        Start game with {store.players.length} players
                    </button>
                ) : (
                    <Text>
                        {store.players.length == 3 ? (
                            'One more player is needed to start the game.'
                        ) : (
                            `${4 - store.players.length} more players are needed to start the game.`
                        )}
                    </Text>
                )
            )}
            <SetNickname store={store} />
        </>
    );
});

export default Lobby;
