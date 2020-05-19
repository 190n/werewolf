import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link as UILink } from '@chakra-ui/core';

interface LinkProps {
    to: string;
    children: React.ReactNode;
}

// https://github.com/emotion-js/emotion/issues/1137 can explain this bullshit
const Link: React.FC<LinkProps> = ({ to, children }) => React.createElement(
    UILink as React.FC<{ as: typeof RouterLink, color: string, textDecoration: string } & LinkProps>,
    {
        as: RouterLink,
        color: 'blue.700',
        textDecoration: 'underline',
        to,
        children,
    },
);

export default Link;
