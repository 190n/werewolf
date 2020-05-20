import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from 'react-router-dom';
import { Box, Flex, Stack, Link } from '@chakra-ui/core';

import { StoreProps } from './WerewolfState';
import JoinOrCreate from './JoinOrCreate';
import Join from './Join';
import InGameDispatch from './InGameDispatch';
import Create from './Create';

const footerLinks: { text: string, url: string }[] = [
    {
        text: 'Source code',
        url: 'https://github.com/190n/werewolf',
    },
    {
        text: 'Roadmap',
        url: 'https://github.com/190n/werewolf/projects/1',
    },
    {
        text: 'Report a bug',
        url: 'https://github.com/190n/werewolf/issues/new',
    },
];

const App = ({ store }: StoreProps): JSX.Element => (
    <Flex h="100vh" direction="column">
        <Box flexGrow={1}>
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
                        <Stack align="center" p={8}>
                            <Join store={store} />
                        </Stack>
                    </Route>
                    <Route path="/">
                        <Stack align="center" p={8}>
                            <JoinOrCreate />
                        </Stack>
                    </Route>
                </Switch>
            </Router>
        </Box>
        <Box as="footer" pb={4} textAlign="center">
            {footerLinks.map(({ text, url }, i) => (
                <React.Fragment key={i}>
                    <Link color="blue.700" textDecoration="underline" href={url} target="_blank">
                        {text}
                    </Link>{i != footerLinks.length - 1 && ' • '}
                </React.Fragment>
            ))}
        </Box>
    </Flex>
);

export default App;
