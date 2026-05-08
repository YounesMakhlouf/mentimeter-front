import {useEffect, useState} from 'react';
import styled from 'styled-components';
import {socket} from '../socket.ts';
import {randomPseudo} from "../utils/pseudoGenerator.ts";
import {EMOJI_AVATARS} from "../design/avatars.ts";
import {GhostButton, Input, LargeButton, PrimaryButton} from "../design/styled.ts";

type JoinStatus = 'idle' | 'submitting' | 'joined' | 'error';
type Step = 'name' | 'avatar';

const Stack = styled.div`
    display: flex;
    flex-direction: column;
    gap: 18px;
`;

const Title = styled.h2`
    font-size: 32px;
    margin: 0;
`;

const Subtle = styled.p`
    color: var(--ink-mute);
    margin: -8px 0 0;
    font-size: 14px;
`;

const Footer = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    gap: 12px;
`;

const AvatarGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
`;

const AvatarPick = styled.button<{$selected: boolean}>`
    aspect-ratio: 1;
    border: ${({$selected}) => $selected ? '3px solid var(--brand)' : '2.5px solid var(--ink)'};
    background: var(--card);
    border-radius: 16px;
    font-size: 32px;
    cursor: pointer;
    box-shadow: ${({$selected}) => $selected ? 'var(--shadow-md)' : 'var(--shadow-sm)'};
    transform: ${({$selected}) => $selected ? 'translateY(-2px)' : 'none'};
    transition: all .15s ease;
    line-height: 1;
    padding: 0;
`;

const ErrorMessage = styled.div`
    color: #bc2525;
    font-weight: 600;
    font-size: 14px;
`;

const SuccessLoader = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    text-align: center;
    padding: 12px 0;
`;

const Spinner = styled.div`
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 5px solid var(--ink);
    border-top-color: transparent;
    animation: spin-slow 1s linear infinite;
`;

interface Props {
    initialCode?: string;
}

const QuizJoinForm = ({initialCode = ''}: Props) => {
    const [step, setStep] = useState<Step>('name');
    const [quizCode, setQuizCode] = useState(initialCode);
    const [playerName, setPlayerName] = useState('');
    const [emojiIdx, setEmojiIdx] = useState(0);
    const [joinStatus, setJoinStatus] = useState<JoinStatus>('idle');

    useEffect(() => {
        const onError = () => setJoinStatus('error');
        const onJoined = () => setJoinStatus('joined');
        socket.on('errorMsg', onError);
        socket.on('playerJoined', onJoined);
        return () => {
            socket.off('errorMsg', onError);
            socket.off('playerJoined', onJoined);
        };
    }, []);

    const submit = () => {
        const name = playerName.trim();
        if (!name || !quizCode.trim()) return;
        const avatar = EMOJI_AVATARS[emojiIdx];
        socket.emit('joinQuiz', {quizCode: quizCode.trim(), playerName: name, avatar});
        localStorage.setItem('name', name);
        setJoinStatus('submitting');
    };

    if (joinStatus === 'joined' || joinStatus === 'submitting') {
        return (
            <Stack>
                <SuccessLoader>
                    <div style={{fontSize: 64, animation: 'wiggle 0.8s ease-in-out infinite'}}>{EMOJI_AVATARS[emojiIdx]}</div>
                    <Title>{joinStatus === 'joined' ? `You're in, ${playerName}!` : `Joining as ${playerName}…`}</Title>
                    <Subtle style={{margin: 0}}>Hang tight, the host will start soon.</Subtle>
                    <Spinner/>
                </SuccessLoader>
            </Stack>
        );
    }

    return (
        <Stack>
            {step === 'name' && (
                <>
                    <Title>What should we call you?</Title>
                    <Subtle>Your classmates will see this on the leaderboard.</Subtle>
                    <Input
                        type="text"
                        placeholder="Quiz code"
                        value={quizCode}
                        onChange={(e) => setQuizCode(e.target.value)}
                    />
                    <Input
                        type="text"
                        autoFocus
                        placeholder={randomPseudo}
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        maxLength={20}
                    />
                    {joinStatus === 'error' && <ErrorMessage>Ooopsie! looks like this quiz doesn't exist.</ErrorMessage>}
                    <Footer>
                        <span/>
                        <PrimaryButton
                            type="button"
                            disabled={!playerName.trim() || !quizCode.trim()}
                            style={{opacity: !playerName.trim() || !quizCode.trim() ? 0.5 : 1}}
                            onClick={() => setStep('avatar')}
                        >
                            Continue →
                        </PrimaryButton>
                    </Footer>
                </>
            )}
            {step === 'avatar' && (
                <>
                    <Title>Pick your buddy</Title>
                    <Subtle>You can change this later.</Subtle>
                    <AvatarGrid>
                        {EMOJI_AVATARS.map((e, i) => (
                            <AvatarPick
                                key={i}
                                type="button"
                                $selected={i === emojiIdx}
                                onClick={() => setEmojiIdx(i)}
                            >{e}</AvatarPick>
                        ))}
                    </AvatarGrid>
                    {joinStatus === 'error' && <ErrorMessage>Ooopsie! looks like this quiz doesn't exist.</ErrorMessage>}
                    <Footer>
                        <GhostButton type="button" onClick={() => setStep('name')}>← Back</GhostButton>
                        <LargeButton type="button" onClick={submit} style={{background: 'var(--brand)', color: 'var(--brand-ink)'}}>
                            Join game →
                        </LargeButton>
                    </Footer>
                </>
            )}
        </Stack>
    );
};

export default QuizJoinForm;
