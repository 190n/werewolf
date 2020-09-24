import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from 'react-router-dom';

import { FlexibleContainer, Root } from './ui';
import { StoreProps } from './WerewolfState';
import JoinOrCreate from './JoinOrCreate';
import Join from './Join';
import InGameDispatch from './InGameDispatch';
import Create from './Create';
import SettingsOverlay from './SettingsOverlay';
import theme from './theme';
import { ColorModeProvider, ThemeProvider } from './color-mode';

const App = ({ store }: StoreProps): JSX.Element => {
    return (
        <ColorModeProvider>
            <ThemeProvider theme={theme}>
                <Root>
                    <FlexibleContainer width="1000px" center={true}>
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
                    </FlexibleContainer>
                    <SettingsOverlay />
                </Root>
            </ThemeProvider>
        </ColorModeProvider>
    );
};

export default App;
