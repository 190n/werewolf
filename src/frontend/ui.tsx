import React from 'react';
import styled, { css } from 'styled-components';
import { transparentize, mix } from 'polished';

import theme from './theme';

export const Root = styled.div`
    font-family: ${props => props.theme.fonts.body};
    color: ${props => props.theme.colors.fg};
    // background-image: linear-gradient(#ddd, #ddd 12.5%, white 12.5%, white);
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
    box-shadow: 0 0.125rem 0.25rem ${props => transparentize(0.5, props.color!)};
    transition: 100ms box-shadow, 100ms background-color;

    &:focus {
        box-shadow: 0 0 0 0.1875rem ${props => transparentize(0.5, props.color!)};
        outline: none;
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
    margin-bottom: 0.75rem;
`;

export const Input = styled.input`
    box-sizing: border-box;
    display: block;
    margin: 0.25rem 0 0 0;
    background-color: ${props => props.theme.colors.bg};
    border: 0.125rem solid ${props => props.theme.colors.primary};
    border-radius: 0.25rem;
    font-size: 1rem;
    font-family: ${props => props.theme.fonts.body};
    height: 2rem;
    padding: 0 0.5rem;
    transition: 100ms box-shadow;
    width: 100%;

    &:focus {
        box-shadow: 0 0 0 0.1875rem ${props => transparentize(0.5, props.theme.colors.primary)};
        outline: none;
    }

    ::placeholder {
        opacity: 0.5;
        color: ${props => props.theme.colors.fg}
    }
`;

export const VisuallyHidden = styled.span`
    &:not(:focus) {
        position: absolute;
        height: 1px;
        width: 1px;
        overflow: hidden;
        clip: rect(1px, 1px, 1px, 1px);
        white-space: nowrap;
    }
`;

export type ToggleButtonProps = ButtonProps & { checked?: boolean, onChange?: (e: React.FormEvent) => void };

const ToggleButtonBase = styled(Button)<ToggleButtonProps>`
    ${props => !props.checked && css<ButtonProps>`
        background-color: transparent;
        color: ${props => props.color};
        border: 0.125rem solid ${props => props.color};
        line-height: ${props => props.big ? '2.75rem' : '1.75rem'};
        padding: 0 ${props => props.big ? '1.375rem' : '0.875rem'};

        &:hover {
            background-color: ${props => transparentize(0.75, props.color!)};
        }
    `}
`;

export const ToggleButton: React.FC<ToggleButtonProps> = props => (
    <label onClick={props.onChange}>
        <VisuallyHidden
            as="input"
            type="checkbox"
            checked={props.checked}
        />
        <ToggleButtonBase {...props} />
    </label>
);

export interface FlexibleContainerProps {
    width: string;
}

export const FlexibleContainer = styled.div<FlexibleContainerProps>`
    width: 100%;
    max-width: ${props => props.width};
    margin: auto;
`;
