import React, { useState } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from 'react-router-dom';
import { ThemeProvider, css } from 'styled-components';

import { StoreProps } from './WerewolfState';
import JoinOrCreate from './JoinOrCreate';
import Join from './Join';
import InGameDispatch from './InGameDispatch';
import Create from './Create';
import { Root, Button, ButtonGroup, FormControl, Input, ToggleButton, FlexibleContainer, ExternalLink, Link, Checkbox, Radio } from './ui';
import theme from './theme';

const App = ({ store }: StoreProps): JSX.Element => {
    const [checked1, setChecked1] = useState(false);
    const [checked2, setChecked2] = useState(true);

    const [checkbox, setCheckbox] = useState(false);

    const [chosenGpu, setChosenGpu] = useState<'AMD'|'Intel'|'Nvidia'|undefined>(undefined);

    return (
        <Router>
            <Switch>
                <Route path="/:gameId/:playerId/play">
                    <InGameDispatch store={store} />
                </Route>
                <Route path="/create">
                    <Create />
                </Route>
                <Route path="/styled2">
                    <ThemeProvider theme={theme}>
                        <Root>
                            <FlexibleContainer width="500px">
                                <h1>Yay! You found the second page!</h1>
                                <Link to="/styled">go back</Link>
                            </FlexibleContainer>
                        </Root>
                    </ThemeProvider>
                </Route>
                <Route path="/styled">
                    <ThemeProvider theme={theme}>
                        <Root>
                            <FlexibleContainer width="500px">
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
                                <ButtonGroup wrap>
                                    <Button>Click me!</Button>
                                    <Button color="gray">Gray button</Button>
                                    <Button color="danger">Dangerous button</Button>
                                    <Button>more buttons!!!</Button>
                                    <Button color="warning">warning!</Button>
                                </ButtonGroup>
                                <ButtonGroup>
                                    <Button big wide>big boi 1</Button>
                                    <Button big wide color="danger">big boi 2</Button>
                                </ButtonGroup>
                                <FormControl>
                                    <label htmlFor="name">Enter your name:</label>
                                    <Input id="name" type="text" placeholder="Firstname Lastname" />
                                </FormControl>
                                <FormControl>
                                    <label htmlFor="iceCream">What's your favorite flavor of ice cream?</label>
                                    <Input id="iceCream" type="text" placeholder="Mint chip" />
                                </FormControl>
                                <ButtonGroup wrap>
                                    <ToggleButton
                                        checked={checked1}
                                        onChange={() => setChecked1(!checked1)}
                                    >
                                        toggle me
                                    </ToggleButton>
                                    <ToggleButton
                                        color="danger"
                                        checked={checked2}
                                        onChange={() => setChecked2(!checked2)}
                                    >
                                        red
                                    </ToggleButton>
                                </ButtonGroup>
                                <p>
                                    <ExternalLink href="https://github.com/">Click here</ExternalLink>
                                    &nbsp;to open GitHub.&nbsp;
                                    <ExternalLink
                                        href="https:/github.com"
                                        openInNewTab={false}
                                    >
                                        This one
                                    </ExternalLink>
                                    &nbsp;won't open in a new tab!
                                </p>
                                <p>
                                    <Link to="/styled2">Go to another page</Link>
                                </p>
                                <Checkbox>
                                    Enable sicko mode
                                </Checkbox>
                                <Checkbox>
                                    Another checkbox! This one is really, really long&hellip;it
                                    might just flow onto another line!
                                </Checkbox>
                                <Checkbox checked={checkbox} onClick={() => setCheckbox(!checkbox)}>
                                    Controlled
                                </Checkbox>
                                <p>
                                    Which type of GPU do you have?
                                </p>
                                {['AMD', 'Intel', 'Nvidia'].map(gpu => (
                                    <Radio checked={chosenGpu == gpu} onClick={() => setChosenGpu(gpu)}>
                                        {gpu}
                                    </Radio>
                                ))}
                            </FlexibleContainer>
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
};

export default App;
