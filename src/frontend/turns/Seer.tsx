import React from 'react';

import { TurnComponent } from '../Turn';

const Seer: TurnComponent = ({ store, onAction }) => {
    return (
        <p>
            Turn for <span className="tag seer">Seer</span>
        </p>
    );
};

export default Seer;
