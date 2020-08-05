import React from 'react';
import styled, { css, StyledComponent } from 'styled-components';
import { transparentize, mix, getLuminance } from 'polished';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';

export function themeValue(theme: any, key: string): string {
    const parts = key.split('.');
    let target = theme;

    for (const part of parts) {
        target = target[part];
        if (target === undefined) return target;
    }

    return target;
}

export const themeColor = (theme: any, key: string) => themeValue(theme, `colors.${key}`);

export function getContrastingColor(color: string, lightColor: string, darkColor: string): string {
    return getLuminance(color) > 0.4 ? darkColor : lightColor;
}

export function themeInvert(theme: any, colorKey: string): string {
    return getContrastingColor(themeColor(theme, colorKey), theme.colors.lightText, theme.colors.darkText);
}

export const Root = styled.div`
    font-family: ${props => props.theme.fonts.body};
    color: ${props => props.theme.colors.fg};
    // background-image: linear-gradient(#ddd, #ddd 12.5%, white 12.5%, white);
    background-size: 100% 0.5rem;
    line-height: 1.5rem;
    padding: 1rem;

    h1, h2, h3, h4, h5, h6 {
        font-family: ${props => props.theme.fonts.heading};
        margin: 0.5rem 0;
    }

    h1 {
        font-size: 3rem;
        line-height: 3rem;
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
    wide?: boolean;
    color?: string;
}

export const Button = styled.button<ButtonProps>`
    border: none;
    background-color: ${props => themeColor(props.theme, props.color!)};
    color: ${props => themeInvert(props.theme, props.color!)};
    line-height: ${props => props.big ? '3rem' : '2rem'};
    font-size: ${props => props.big ? '1.25rem' : '1rem'};
    font-family: ${props => props.theme.fonts.body};
    cursor: pointer;
    border-radius: ${props => props.big ? '0.375rem' : '0.25rem'};
    padding: 0 ${props => props.big ? '1.5rem' : '1rem'};
    box-shadow: 0 0.125rem 0.25rem ${props => transparentize(0.5, themeColor(props.theme, props.color!))};
    transition: 100ms box-shadow, 100ms background-color;
    user-select: none;

    &:focus {
        box-shadow: 0 0 0 0.1875rem ${props => transparentize(0.5, themeColor(props.theme, props.color!))};
        outline: none;
    }

    &:hover {
        background-color: ${props => mix(0.25, '#fff', themeColor(props.theme, props.color!))};
    }

    &:active {
        background-color: ${props => themeColor(props.theme, props.color!)}
    }

    &::-moz-focus-inner {
        border: 0;
    }

    ${props => props.wide && css`
        width: 100%;
    `}
`;

Button.defaultProps = {
    color: 'primary',
};

export interface ButtonGroupProps {
    wrap?: boolean;
}

export const ButtonGroup = styled.div<ButtonGroupProps>`
    display: flex;
    align-items: center;
    flex-wrap: ${props => props.wrap ? 'wrap' : 'nowrap'};
    margin: 0.75rem -0.25rem;;

    ${Button} {
        margin: 0.25rem;
    }
`;

export const FormControl = styled.div`
    margin: 0.5rem auto;
    text-align: left;
    max-width: 16rem;


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
    position: absolute;
    height: 1px;
    width: 1px;
    overflow: hidden;
    clip: rect(1px, 1px, 1px, 1px);
    white-space: nowrap;
`;

export type ToggleButtonProps = ButtonProps & { checked?: boolean, onChange?: (e: React.FormEvent) => void };

const ToggleButtonBase = styled(Button)<ToggleButtonProps>`
    border: 0.125rem solid ${props => themeColor(props.theme, props.color!)};
    line-height: ${props => props.big ? '2.75rem' : '1.75rem'};
    padding: 0 ${props => props.big ? '1.375rem' : '0.875rem'};
    color: ${props => props.theme.colors.fg};

    ${props => props.checked ? css<ButtonProps>`
        background-color: ${props => transparentize(0.75, themeColor(props.theme, props.color!))};

        &:hover {
            background-color: ${props => transparentize(0.5, themeColor(props.theme, props.color!))};
        }
    ` : css<ButtonProps>`
        background-color: transparent;

        &:hover {
            background-color: ${props => transparentize(0.9, themeColor(props.theme, props.color!))};
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
    center?: boolean;
}

export const FlexibleContainer = styled.div<FlexibleContainerProps>`
    width: 100%;
    max-width: ${props => props.width};
    margin: auto;
    ${props => props.center && css`text-align: center;`}
`;

export interface ExternalLinkProps {
    openInNewTab?: boolean;
}

export const ExternalLink = styled.a.attrs<ExternalLinkProps>(props => props.openInNewTab === false ? {} : { target: '_blank', rel: 'noopener' })`
    color: ${props => props.theme.colors.link};
    text-decoration: underline;
` as StyledComponent<'a', any, ExternalLinkProps, never>;

export const Link = styled(ExternalLink).attrs({ as: RouterLink, target: '', rel: '' })`` as StyledComponent<typeof RouterLink, any, RouterLinkProps, never>;

const CheckboxWrapper = styled.label`
    user-select: none;
    display: flex;
`;

const CheckboxControlWrapper = styled.div.attrs({ 'aria-hidden': true })`
    flex: 0 0 1.5rem;
    padding-right: 0.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const CheckboxControl = styled.span`
    width: 1rem;
    height: 1rem;
    font-size: 0;
    display: block;
    position: relative;

    &::before {
        content: '';
        display: block;
        width: 0.75rem;
        height: 0.75rem;
        background-color: white;
        border: 0.125rem solid ${props => props.theme.colors.gray};
        border-radius: 0.1875rem;
        transition: 100ms box-shadow, 100ms border-color;
        box-shadow: 0 0 0 0 ${props => props.theme.colors.primary} inset, 0 0 0 0 ${props => transparentize(0.5, props.theme.colors.primary)};
    }

    input:checked + ${CheckboxControlWrapper} > &::before {
        box-shadow: 0 0 0 0.5rem ${props => props.theme.colors.primary} inset, 0 0 0 0 ${props => transparentize(0.5, props.theme.colors.primary)};
        border-color: ${props => props.theme.colors.primary};
    }

    input:focus + ${CheckboxControlWrapper} > &::before {
        border-color: ${props => props.theme.colors.primary};
        box-shadow: 0 0 0 0 ${props => props.theme.colors.primary} inset, 0 0 0 0.1875rem ${props => transparentize(0.5, props.theme.colors.primary)};
    }

    input:focus:checked + ${CheckboxControlWrapper} > &::before {
        box-shadow: 0 0 0 0.5rem ${props => props.theme.colors.primary} inset, 0 0 0 0.1875rem ${props => transparentize(0.5, props.theme.colors.primary)};
    }

    &::after {
        content: '';
        display: block;
        z-index: 9999;
        position: absolute;
        width: 0.5rem;
        height: 0.25rem;
        border: solid ${props => themeInvert(props.theme, 'primary')};
        border-width: 0 0 0.125rem 0.125rem;
        top: 0.25rem;
        left: 0.1875rem;
        transform: rotate(-45deg) scale(0);
        transition: 100ms transform;
    }

    input:checked + ${CheckboxControlWrapper} > &::after {
        transform: rotate(-45deg) scale(1);
    }
`;

export const Checkbox: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = props => (
    <CheckboxWrapper>
        <VisuallyHidden as="input" type="checkbox" {...props} />
        <CheckboxControlWrapper>
            <CheckboxControl />
        </CheckboxControlWrapper>
        <span>
            {props.children}
        </span>
    </CheckboxWrapper>
);

const RadioControl = styled(CheckboxControl)`
    &::before {
        border-radius: 0.5rem;
    }

    &::after {
        width: 0.375rem;
        height: 0.375rem;
        border-radius: 0.1875rem;
        border: none;
        background-color: ${props => themeInvert(props.theme, 'primary')};
        top: 0.3125rem;
        left: 0.3125rem;
        transform: scale(0);
    }

    input:checked + ${CheckboxControlWrapper} > &::after {
        transform: scale(1);
    }
`;

export const Radio: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = props => (
    <CheckboxWrapper>
        <VisuallyHidden as="input" type="radio" {...props} />
        <CheckboxControlWrapper>
            <RadioControl />
        </CheckboxControlWrapper>
        <span>
            {props.children}
        </span>
    </CheckboxWrapper>
);
