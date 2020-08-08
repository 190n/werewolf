import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { MdVolumeOff, MdVolumeUp, MdOpenInNew } from 'react-icons/md';

import { ExternalLink, IconButton } from './ui';
import opusFile from './music/fantasy-ukulele.opus';
import cafFile from './music/fantasy-ukulele.caf';
import m4aFile from './music/fantasy-ukulele.m4a';

const FloatingContainerLeft = styled.div`
    position: fixed;
    left: 0.5rem;
    bottom: 0.5rem;
    height: 2rem;
    text-align: left;
    display: flex;
    align-items: center;
`;

export default function SettingsOverlay(): JSX.Element {
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

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
