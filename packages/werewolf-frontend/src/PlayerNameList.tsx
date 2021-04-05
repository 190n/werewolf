import React from 'react';

import { Player } from './WerewolfState';

export default function PlayerNameList({ players, ownId }: { players: Player[], ownId?: string }): JSX.Element {
    return (
        <>
            {players.map((p, i) => {
                const nameElem = p.id == ownId ? 'you' : <strong>{p.nick}</strong>;

                if (i == players.length - 1) {
                    return <React.Fragment key={i}>{nameElem}</React.Fragment>;
                } else if (i == players.length - 2 && players.length == 2) {
                    return <React.Fragment key={i}>{nameElem} and </React.Fragment>;
                } else if (i == players.length - 2 && players.length > 2) {
                    return <React.Fragment key={i}>{nameElem}, and </React.Fragment>;
                } else {
                    return <React.Fragment key={i}>{nameElem}, </React.Fragment>;
                }
            })}
        </>
    );
}
