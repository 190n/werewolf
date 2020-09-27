import React, { useState, useEffect } from 'react';
import {
    BrowserRouter,
    Switch,
    Route,
} from 'react-router-dom';
import styled from 'styled-components';

import { FlexibleContainer } from './ui';
import { StoreProps } from './WerewolfState';
import JoinOrCreate from './JoinOrCreate';
import Join from './Join';
import InGameDispatch from './InGameDispatch';
import Create from './Create';
import Cheatsheet from './Cheatsheet';

const Layout = styled.div<{ cheatsheetVisible: boolean }>`
    display: flex;
    width: ${props => props.cheatsheetVisible ? '100vw' : '133vw'};
    transition: 250ms width;

    @media screen and (prefers-reduced-motion: reduce) {
        transition: none;
    }
`;

const MainColumns = ({ store }: StoreProps): JSX.Element => {
    const [cheatsheetVisible, setCheatsheetVisible] = useState(window.localStorage.getItem('cheatsheetVisible') == 'true');

    useEffect(() => window.localStorage.setItem('cheatsheetVisible', cheatsheetVisible.toString()), [cheatsheetVisible]);

    return (
        <Layout cheatsheetVisible={cheatsheetVisible}>
            <FlexibleContainer width="1000px" center={true}>
                <BrowserRouter>
                    <Switch>
                        <Route path="/:gameId/:playerId/play">
                            <InGameDispatch store={store} />
                        </Route>
                        <Route path="/create">
                            <Create />
                        </Route>
                        <Route path="/:gameId">
                            <Join store={store} />
                        </Route>
                        <Route path="/">
                            <JoinOrCreate />
                        </Route>
                    </Switch>
                </BrowserRouter>
            </FlexibleContainer>
            <Cheatsheet visible={cheatsheetVisible} setVisible={setCheatsheetVisible} />
        </Layout>
    );
};

export default MainColumns;
