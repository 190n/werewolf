import React from 'react';
import { observer } from 'mobx-react';
import { Box, List, ListItem, Text } from '@chakra-ui/core';

import { StoreProps, Player as PlayerType } from './WerewolfState';

export interface PlayerProps {
    player: PlayerType;
    isSelf: boolean;
}

export function Player({ player: { nick }, isSelf }: PlayerProps): JSX.Element {
    return (
        /* could be shadowed box in two columns */
        <Box flexBasis="50%" textAlign="center" p={2} border="">
            <Text fontSize="2xl" as="b">{nick}</Text>
            {isSelf && <Text as="span"> (you)</Text>}
        </Box>
    );
}

const PlayerList = observer(({ store }: StoreProps): JSX.Element => {
    return (
        <Box w="100%" maxWidth="md" d="flex" flexWrap="wrap" my={2}>
            {
                store.players.map((p, i) => <Player player={p} isSelf={p.id == store.ownId} key={p.id} />)
            }
        </Box>
    );
});

export default PlayerList;
