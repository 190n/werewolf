import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { MdVolumeOff, MdVolumeUp, MdOpenInNew, MdBrightness3, MdBrightness7 } from 'react-icons/md';

import { ExternalLink, IconButton } from './ui';
import opusFile from './music/fantasy-ukulele.opus';
import cafFile from './music/fantasy-ukulele.caf';
import m4aFile from './music/fantasy-ukulele.m4a';
import { useColorMode, ColorMode, ColorModePreference } from './color-mode';

const FloatingContainerLeft = styled.div`
    position: fixed;
    left: 0.5rem;
    bottom: 0.5rem;
    height: 2rem;
    text-align: left;
    display: flex;
    align-items: center;
`;

const ColorModeSelect = styled.select<{ colorMode: ColorMode }>`
    appearance: none;
    cursor: pointer;
    background-color: transparent;
    background-size: 100%;
    background-image: ${props => props.colorMode == 'light'
        ? `url("data:image/svg+xml,%3Csvg stroke='currentColor' fill='${encodeURIComponent(props.theme.colors.fg)}' stroke-width='0' viewBox='0 0 24 24' height='1em' width='1em' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18a6 6 0 11.01-12.01A6 6 0 0112 18zm0-10a4 4 0 100 8 4 4 0 000-8z' stroke='none'/%3E%3C/svg%3E")`
        : `url("data:image/svg+xml,%3Csvg stroke='currentColor' fill='${encodeURIComponent(props.theme.colors.fg)}' stroke-width='0' viewBox='0 0 24 24' height='1em' width='1em' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M9 2a9.9 9.9 0 00-3 .46 10 10 0 010 19.08A10 10 0 109 2z' stroke='none'/%3E%3C/svg%3E")`};
    border: none;
    width: 2rem;
    height: 2rem;
    margin-right: 0.5rem;
    font-size: 0;

    option {
        font-size: 1rem;
    }
`;

const prefNames: { [pref: string]: string } = {
    light: 'Light',
    dark: 'Dark',
    system: 'System default',
};

export default function SettingsOverlay(): JSX.Element {
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const { colorMode, colorModePreference, setColorModePreference } = useColorMode();

    function playPause() {
        if (isMusicPlaying) {
            // pause
            audioRef.current?.pause();
            setIsMusicPlaying(false);
        } else {
            // play
            audioRef.current?.play();
            setIsMusicPlaying(true);
        }
    }

    return (
        <FloatingContainerLeft>
            <audio loop preload="metadata" ref={audioRef}>
                <source src={opusFile} type="audio/ogg; codecs=opus" />
                <source src={cafFile} type="audio/x-caf; codecs=opus" />
                <source src={m4aFile} type="audio/mp4; codecs=mp4a.40.2" />
            </audio>
            <ColorModeSelect
                colorMode={colorMode}
                value={colorModePreference}
                onChange={e => setColorModePreference(e.target.value as ColorModePreference)}
            >
                {Object.keys(prefNames).map(p => (
                    <option value={p} key={p}>{prefNames[p]}</option>
                ))}
            </ColorModeSelect>
            <IconButton onClick={playPause}>
                {isMusicPlaying ? <MdVolumeUp /> : <MdVolumeOff />}
            </IconButton>
            {isMusicPlaying && (
                <span>
                    &nbsp;by <ExternalLink href="https://youtu.be/shdP64nBMOM">Ukulele Hunt <MdOpenInNew style={{ position: 'relative', top: '0.125rem' }} /></ExternalLink>
                </span>
            )}
        </FloatingContainerLeft>
    );
}
