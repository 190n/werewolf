import 'preact/debug';
import React from 'react';
import ReactDOM from 'react-dom';
import { CSSReset, ColorModeProvider, ThemeProvider } from '@chakra-ui/core';

import WerewolfState from './WerewolfState';
import App from './App';
import theme from './theme';

const store = new WerewolfState();

ReactDOM.render(
    <ThemeProvider theme={theme}>
        <ColorModeProvider>
            <CSSReset />
            <App store={store} />
        </ColorModeProvider>
    </ThemeProvider>,
    document.getElementById('app')
);
