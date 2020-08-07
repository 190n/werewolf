import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { StoreProps } from './WerewolfState';

const Countdown = styled.h1<{ totalSeconds: number }>`
    h1& {
        font-size: 8rem;
        line-height: 8rem;
        font-feature-settings: "tnum";
        transition: 1s color;
        color: ${props => props.totalSeconds < 10 ? props.theme.colors.lastSeconds : (props.totalSeconds < 60 ? props.theme.colors.danger : props.theme.colors.fg)};
    }
`;

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
            <Countdown totalSeconds={totalSeconds}>
                {minutes}
                :
                {seconds}
            </Countdown>
            <h3>
                Discuss what happened during the night!
            </h3>
        </div>
    );
});

export default Discussion;
