import React from 'react';
import { observer } from 'mobx-react';

import { StoreProps, Player as PlayerType } from './WerewolfState';

export interface PlayerProps {
    player: PlayerType;
    index: number;
    isSelf: boolean;
}

export function Player({ player: { nick }, index, isSelf }: PlayerProps): JSX.Element {
    let className = 'Player';
    if (typeof nick != 'string') {
        className += ' unnamed';
    }
    if (isSelf) {
        className += ' self';
    }

    return (
        <div className={className}>
            {
                typeof nick == 'string'
                ? nick
                : `Unnamed Player ${index + 1}`
            }
        </div>
    );
}

const PlayerList = observer(({ store }: StoreProps): JSX.Element => {
    return (
        <div className="PlayerList">
            {
                store.players.map((p, i) => <Player player={p} index={i} isSelf={p.id == store.ownId} key={p.id} />)
            }
        </div>
    );
});

export default PlayerList;
