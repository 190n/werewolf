import React from 'react';
import { observer } from 'mobx-react';

import { StoreProps } from './WerewolfState';

const Wait = ({ store }: StoreProps): JSX.Element => (
    <div className="Wait">
        <h1>Waiting for other players...</h1>
    </div>
);

export default Wait;
