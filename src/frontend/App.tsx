import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import { Root, FlexibleContainer } from './ui';
import { StoreProps } from './WerewolfState';
import SettingsOverlay from './SettingsOverlay';
import MainColumns from './MainColumns';
import theme from './theme';
import { ColorModeProvider, ThemeProvider } from './color-mode';
import { CheatsheetText } from './Cheatsheet';

const App = ({ store }: StoreProps): JSX.Element => {
    return (
        <ColorModeProvider>
            <ThemeProvider theme={theme}>
                <BrowserRouter>
                    <Root>
                        <Switch>
                            <Route path="/cheatsheet">
                                <FlexibleContainer width="800px">
                                    <CheatsheetText />
                                </FlexibleContainer>
                            </Route>
                            <Route>
                                <MainColumns store={store} />
                            </Route>
                        </Switch>
                        <SettingsOverlay />
                    </Root>
                </BrowserRouter>
            </ThemeProvider>
        </ColorModeProvider>
    );
};

export default App;
