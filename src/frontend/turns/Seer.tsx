import React from 'react';

import { TurnComponent } from '../Turn';

const Seer: TurnComponent = ({ players, revelations, onAction }) => {
    return (
        <p>
            Turn for <span className="tag seer">Seer</span>
        </p>
    );
};

export default Seer;
