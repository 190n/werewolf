import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from 'react-router-dom';

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
                <Create />
            </Route>
            <Route path="/:gameId">
                <Join store={store} />
            </Route>
            <Route path="/">
                <JoinOrCreate />
            </Route>
        </Switch>
    </Router>
);

export default App;
