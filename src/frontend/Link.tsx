import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link as UILink } from '@chakra-ui/core';

interface LinkProps {
    to: string;
    children: React.ReactNode;
}

// https://github.com/emotion-js/emotion/issues/1137 can explain this bullshit
const Link: React.FC<LinkProps> = ({ to, children }) => React.createElement(
    UILink as React.FC<{ as: typeof RouterLink } & LinkProps>,
    {
        as: RouterLink,
        to,
        children,
    },
);

export default Link;
