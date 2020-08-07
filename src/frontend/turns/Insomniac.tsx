import React from 'react';
import { observer } from 'mobx-react';

import { TurnComponent } from '../Turn';
import { Tag } from '../ui';

const Insomniac: TurnComponent = observer(({ store: { revelations, ownActions }, onAction }) => {
    if (revelations.length == 0) {
        return (
            <p>Waiting for server...</p>
        );
    } else {
        return (
            <>
                <p>
                    Your final card is {revelations[0] == 'insomniac' && 'still'} the&nbsp;
                    <Tag card={revelations[0]} />.
                </p>
                <button onClick={() => onAction('')} disabled={ownActions.length > 0}>OK</button>
            </>
        );
    }
});

export default Insomniac;
