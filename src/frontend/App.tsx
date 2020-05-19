import React, { useEffect } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from 'react-router-dom';
import { Stack } from '@chakra-ui/core';

import { StoreProps } from './WerewolfState';
import JoinOrCreate from './JoinOrCreate';
import Join from './Join';
import InGameDispatch from './InGameDispatch';
import Create from './Create';

const App = ({ store }: StoreProps): JSX.Element => (
    <Router>
        <Switch>
            <Route path="/:gameId/:playerId/play">
                <InGameDispatch store={store} />
            </Route>
            <Route path="/create">
                <Stack align="center" p={8}>
                    <Create />
                </Stack>
            </Route>
            <Route path="/:gameId">
                <Join store={store} />
            </Route>
            <Route path="/">
                <Stack align="center" p={8}>
                    <JoinOrCreate />
                </Stack>
            </Route>
        </Switch>
    </Router>
);

export default App;
