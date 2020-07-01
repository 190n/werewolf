import styled from 'styled-components';
import { transparentize, mix } from 'polished';

import theme from './theme';

export const Root = styled.div`
    font-family: ${props => props.theme.fonts.body};
    color: ${props => props.theme.colors.fg};
    background-image: linear-gradient(silver, silver 12.5%, white 12.5%, white);
    background-size: 100% 0.5rem;
    line-height: 1.5rem;

    h1, h2, h3, h4, h5, h6 {
        font-family: ${props => props.theme.fonts.heading};
        margin: 0.5rem 0 0 0;
    }

    h1 {
        font-size: 3rem;
        line-height: 3.5rem;
    }

    h2 {
        font-size: 2rem;
        line-height: 2.5rem;
    }

    h3 {
        font-size: 1.5rem;
        line-height: 2rem;
    }
`;

export interface ButtonProps {
    big?: boolean;
    color?: string;
}

export const Button = styled.button<ButtonProps>`
    border: none;
    background-color: ${props => props.color};
    color: ${props => props.theme.colors.primaryInvert};
    line-height: ${props => props.big ? '3rem' : '2rem'};
    font-size: ${props => props.big ? '1.25rem' : '1rem'};
    cursor: pointer;
    border-radius: ${props => props.big ? '0.375rem' : '0.25rem'};
    padding: 0 ${props => props.big ? '1.5rem' : '1rem'};
    box-shadow: 0 0.15rem 0.25rem ${props => transparentize(0.5, props.color!)};
    transition: 100ms box-shadow, 100ms background-color;

    &:focus {
        box-shadow: 0 0 0 0.25rem ${props => transparentize(0.5, props.color!)};
    }

    &:hover {
        background-color: ${props => mix(0.25, '#fff', props.color!)};
    }

    &:active {
        background-color: ${props => props.color}
    }

    &::-moz-focus-inner {
        border: 0;
    }
`;

Button.defaultProps = {
    big: false,
    color: theme.colors.primary,
};

export const ButtonGroup = styled.div`
    display: flex;
    align-items: center;
    margin: 0 -0.25rem;

    ${Button} {
        margin: 0 0.25rem;
    }
`;

export const FormControl = styled.label`
    display: block;
`;
export const Input = styled.input``;
