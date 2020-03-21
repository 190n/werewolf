import React, { useState } from 'react';
import { observer } from 'mobx-react';

import { StoreProps } from './WerewolfState';
import useSharedSocket from './use-shared-socket';

const ViewCard = observer(({ store }: StoreProps): JSX.Element => {
    const [hasConfirmed, setHasConfirmed] = useState(false);
    const [sendMessage] = useSharedSocket();

    function confirm() {
        setHasConfirmed(true);
        sendMessage(JSON.stringify({
            type: 'confirmOwnCard',
        }));
    }

    return (
        <div className="ViewCard">
            {store.ownCard === undefined ? (
                <p>Waiting to be assigned a card...</p>
            ) : (
                <>
                    <h1 className={`card-reveal ${store.ownCard}`}>
                        You are the&nbsp;
                        <span className="card-name">{store.ownCard}</span>
                    </h1>
                    {hasConfirmed ? (
                        'Waiting for other players to confirm...'
                    ) : (
                        <button onClick={confirm}>OK</button>
                    )}
                </>
            )}
        </div>
    );
});

export default ViewCard;
