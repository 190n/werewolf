import React from 'react';
import { observer } from 'mobx-react';

import { StoreProps } from './WerewolfState';

const Turn = observer(({ store }: StoreProps): JSX.Element => {
    return (
        <div className="Turn">
            Turn for {store.ownCard}<br />
            Info: {store.initialRevealedInformation}
        </div>
    );
});

export default Turn;
