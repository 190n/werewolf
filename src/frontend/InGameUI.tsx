import React, { useState } from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Button, ButtonGroup, Input } from './ui';
import { StoreProps } from './WerewolfState';
import useSharedSocket from './use-shared-socket';

const FloatingContainer = styled.div`
    position: absolute;
    right: 0.5rem;
    bottom: 0.5rem;
    text-align: right;
`;

const ErrorMessage = styled.span`
    text-align: left;
    display: block;
    color: ${props => props.theme.colors.danger};
`;

const InGameUI = observer(({ store }: StoreProps): JSX.Element => {
    const [isFormExpanded, setIsFormExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [nicknameEntry, setNicknameEntry] = useState(store.ownNickname ?? '');

    const [sendMessage] = useSharedSocket({
        onMessage({ data }: MessageEvent) {
            try {
                const message = JSON.parse(data);
                if (message.type == 'nickAccept') {
                    setIsLoading(false);
                    setIsFormExpanded(false);
                    setRejectionReason('');
                } else if (message.type == 'nickReject') {
                    setIsLoading(false);
                    setRejectionReason(message.reason);
                }
            } catch (e) {}
        }
    });

    function submitNickname() {
        sendMessage(JSON.stringify({
            type: 'nick',
            nick: nicknameEntry,
        }));
        setIsLoading(true);
    }

    return (
        <FloatingContainer>
            <ErrorMessage>{rejectionReason}</ErrorMessage>
            <ButtonGroup inline={true}>
                {isFormExpanded ? (
                    <form onSubmit={e => { e.preventDefault(); submitNickname(); }}>
                        <Input
                            type="text"
                            value={nicknameEntry}
                            onChange={e => setNicknameEntry(e.target.value)}
                            inline={true}
                            placeholder="Nickname"
                        />
                        <Button
                            type="button"
                            color="gray"
                            onClick={() => setIsFormExpanded(false)}
                        >
                            Cancel
                        </Button>
                        <Button disabled={nicknameEntry == '' || isLoading}>
                            OK
                        </Button>
                    </form>
                ) : (
                    <Button onClick={() => setIsFormExpanded(true)}>Change nickname</Button>
                )}
                {store.isLeader && (
                    <Button
                        onClick={() => confirm('Are you sure?') && sendMessage(JSON.stringify({ type: 'restart' }))}
                        color="danger"
                    >
                        Restart game
                    </Button>
                )}
            </ButtonGroup>
        </FloatingContainer>
    );
});

export default InGameUI;
