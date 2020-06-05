import React from 'react';
import { observer } from 'mobx-react';
import { List, ListItem, Text } from '@chakra-ui/core';

import { StoreProps, Player as PlayerType } from './WerewolfState';

export interface PlayerProps {
    player: PlayerType;
    isSelf: boolean;
}

export function Player({ player: { nick }, isSelf }: PlayerProps): JSX.Element {
    return (
        <ListItem>
            <Text fontSize="xl" as="b">{nick}</Text>
            {isSelf && <Text as="span"> (you)</Text>}
        </ListItem>
    );
}

const PlayerList = observer(({ store }: StoreProps): JSX.Element => {
    return (
        <List>
            {
                store.players.map((p, i) => <Player player={p} isSelf={p.id == store.ownId} key={p.id} />)
            }
        </List>
    );
});

export default PlayerList;
