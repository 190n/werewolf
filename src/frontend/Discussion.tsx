import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';

import { StoreProps } from './WerewolfState';

const Discussion = observer(({ store }: StoreProps): JSX.Element => {
    const [totalSeconds, setTotalSeconds] = useState(0);

    function tick() {
        setTotalSeconds(Math.max(0, store.discussionEndTime - Math.floor(Date.now() / 1000)));
    }

    useEffect(() => {
        tick();
        const interval = window.setInterval(tick, 1000);
        return () => window.clearInterval(interval);
    }, [store.discussionEndTime]);

    const minutes = Math.floor(totalSeconds / 60),
        seconds = (totalSeconds % 60 < 10) ? `0${(totalSeconds % 60).toString()}` : (totalSeconds % 60).toString();

    return (
        <div className="Discussion">
            <h1 className="countdown">
                {minutes}
                :
                {seconds}
            </h1>
            <p>
                Discuss what happened during the night!
            </p>
        </div>
    );
});

export default Discussion;
