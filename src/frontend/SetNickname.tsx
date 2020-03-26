import React, { useState } from 'react';
import { observer } from 'mobx-react';

import { StoreProps } from './WerewolfState';
import useSharedSocket from './use-shared-socket';

function SetNicknameForm({ onSubmit, initial }: {
    onSubmit: (nickname: string) => void,
    initial?: string,
}): JSX.Element {
    const [nickname, setNickname] = useState(initial ?? '');

    const submitHandler = (e: React.FormEvent) => {
        e.preventDefault();
        if (nickname.length == 0) return;
        onSubmit(nickname);
    };

    return (
        <form onSubmit={submitHandler}>
            <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
            />
            <input type="submit" value="Set nickname" disabled={nickname.length == 0} />
        </form>
    );
}

const SetNickname = observer(({ store }: StoreProps): JSX.Element => {
    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [sendMessage] = useSharedSocket({
        onMessage({ data }: MessageEvent) {
            try {
                const message = JSON.parse(data);
                if (message.type == 'nickAccept') {
                    setIsLoading(false);
                    setIsDialogVisible(false);
                    setRejectionReason('');
                } else if (message.type == 'nickReject') {
                    setIsLoading(false);
                    setRejectionReason(message.reason);
                }
            } catch (e) {}
        }
    });

    function submitNickname(nickname: string) {
        sendMessage(JSON.stringify({
            type: 'nick',
            nick: nickname,
        }));
        setIsLoading(true);
    }

    if (store.ownNickname?.startsWith('Player') || isDialogVisible) {
        return (
            <div className="SetNickname">
                <h2>{store.ownNickname?.startsWith('Player') ? 'What\'s your name?' : 'Change nickname'}</h2>
                <SetNicknameForm onSubmit={submitNickname} />
                <p>
                    {isLoading && 'Waiting for server...'}
                    {rejectionReason}
                </p>
                {isDialogVisible && (
                    <button onClick={() => setIsDialogVisible(false)}>Close</button>
                )}
            </div>
        );
    } else {
        return (
            <div className="SetNickname">
                <button onClick={() => setIsDialogVisible(true)}>Change nickname</button>
            </div>
        );
    }
});

export default SetNickname;
