import React from 'react';

import { StoreProps } from './WerewolfState';

const Wait = ({ store }: StoreProps): JSX.Element => (
    <h1>Waiting for other players...</h1>
);

export default Wait;
