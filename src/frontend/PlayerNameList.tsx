import React from 'react';

import { Player } from './WerewolfState';

export default function PlayerNameList({ players }: { players: Player[] }): JSX.Element {
    return (
        <>
            {players.map((p, i) => {
                if (i == players.length - 1) {
                    return <strong key={i}>{p.nick}</strong>;
                } else if (i == players.length - 2 && players.length == 2) {
                    return <React.Fragment key={i}><strong>{p.nick}</strong> and </React.Fragment>;
                } else if (i == players.length - 2 && players.length > 2) {
                    return <React.Fragment key={i}><strong>{p.nick}</strong>, and </React.Fragment>;
                } else {
                    return <React.Fragment key={i}><strong>{p.nick}</strong>, </React.Fragment>;
                }
            })}
        </>
    );
}
