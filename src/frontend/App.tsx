import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import { StoreProps } from './WerewolfState';
import JoinOrCreate from './JoinOrCreate';
import Join from './Join';
import InGameDispatch from './InGameDispatch';
import Create from './Create';
import { Root, Button, ButtonGroup, FormControl, Input } from './ui';
import theme from './theme';

const App = ({ store }: StoreProps): JSX.Element => (
    <Router>
        <Switch>
            <Route path="/:gameId/:playerId/play">
                <InGameDispatch store={store} />
            </Route>
            <Route path="/create">
                <Create />
            </Route>
            <Route path="/styled">
                <ThemeProvider theme={theme}>
                    <Root>
                        <p>
                            foo bar<br />
                            baz qux<br />
                            wom bat
                        </p>
                        <p>
                            Lorem ipsum...
                        </p>
                        <h1>Heading</h1>
                        <h2>Subheading!</h2>
                        <h3>Level 3</h3>
                        <ButtonGroup>
                            <Button>Click me!</Button>
                            <Button color="#008000">Green button</Button>
                            <Button big={true}>Thicc button</Button>
                        </ButtonGroup>
                        <FormControl>
                            Label:
                            <Input type="text" placeholder="field" />
                        </FormControl>
                    </Root>
                </ThemeProvider>
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
