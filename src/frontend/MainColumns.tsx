import React from 'react';
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

const Layout = styled.div`
    display: flex;
`;

const MainColumns = ({ store }: StoreProps): JSX.Element => (
    <Layout>
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
        <Cheatsheet />
    </Layout>
);

export default MainColumns;
