import React from 'react';


import { Root } from './ui';
import { StoreProps } from './WerewolfState';
import SettingsOverlay from './SettingsOverlay';
import MainColumns from './MainColumns';
import theme from './theme';
import { ColorModeProvider, ThemeProvider } from './color-mode';

const App = ({ store }: StoreProps): JSX.Element => {
    return (
        <ColorModeProvider>
            <ThemeProvider theme={theme}>
                <Root>
                    <MainColumns store={store} />
                    <SettingsOverlay />
                </Root>
            </ThemeProvider>
        </ColorModeProvider>
    );
};

export default App;
