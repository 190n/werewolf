import React from 'react';
import { observer } from 'mobx-react';

import { ToggleButton, ButtonGroup } from './ui';
import { StoreProps } from './WerewolfState';

const PlayerList = observer(({ store }: StoreProps): JSX.Element => {
    return (
        <ButtonGroup align="center">
            {
                store.players.map(p => (
                    <ToggleButton big disabled style={{ cursor: 'default' }} key={p.id}>
                        {p.nick}{p.isLeader && <small>(host)</small>}
                    </ToggleButton>
                ))
            }
        </ButtonGroup>
    );
});

export default PlayerList;
