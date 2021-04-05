import React from 'react';
import ReactDOM from 'react-dom';

import WerewolfState from './WerewolfState';
import App from './App';

const store = new WerewolfState();

ReactDOM.render(<App store={store} />, document.getElementById('app') as HTMLElement);
