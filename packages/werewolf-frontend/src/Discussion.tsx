import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { transparentize } from 'polished';

import { StoreProps } from './WerewolfState';

const Countdown = styled.h1<{ totalSeconds: number }>`
    font-size: 8rem !important;         // !important = workaround until https://github.com/styled-components/styled-components/issues/3401 is fixed
    line-height: 8rem !important;       // once it is, wrap all these styles in h1& {} to increase specificity
    font-feature-settings: "tnum";
    transition: 1s color, 1s text-shadow;
    color: ${props => props.totalSeconds < 10 ? props.theme.colors.lastSeconds : (props.totalSeconds < 60 ? props.theme.colors.danger : props.theme.colors.fg)};
    text-shadow: ${props => props.totalSeconds < 10
        ? `0 0 2rem ${transparentize(0.5, props.theme.colors.lastSeconds)}`
        : `0 0 0 ${transparentize(0.5, props.theme.colors.lastSeconds)}`};
`;

const Discussion = observer(({ store }: StoreProps): JSX.Element => {
    const [totalSeconds, setTotalSeconds] = useState(-1);

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
            <Countdown totalSeconds={totalSeconds < 0 ? 120 : totalSeconds}>
                {totalSeconds < 0 ? '\u00a0' : `${minutes}:${seconds}`}
            </Countdown>
            <h3>
                Discuss what happened during the night!
            </h3>
        </div>
    );
});

export default Discussion;
