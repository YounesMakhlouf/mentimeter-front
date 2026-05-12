import {useEffect, useState} from 'react';
import styled from 'styled-components';
import {socket} from '../socket.ts';
import {randomPseudo} from "../utils/pseudoGenerator.ts";
import {Button, EMOJI_AVATARS, ErrorText, Input} from "../design";

type JoinStatus = 'idle' | 'submitting' | 'joined' | 'error';
type Step = 'name' | 'avatar';

const Stack = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const Title = styled.h2`
    margin: 0;
`;

const Subtle = styled.p`
    color: var(--ink-mute);
    margin: 0;
    font-size: var(--step--1);
`;

const TitleSubtle = styled(Subtle)`
    margin-top: -0.5rem;
`;

const AvatarPreview = styled.div`
    font-size: var(--step-5);
    animation: wiggle 0.8s ease-in-out infinite;
`;

const Footer = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
    gap: 0.75rem;
`;

const AvatarGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
`;

const AvatarPick = styled.button<{$selected: boolean}>`
    aspect-ratio: 1;
    border: ${({$selected}) => $selected ? '3px solid var(--brand)' : '2.5px solid var(--ink)'};
    background: var(--card);
    border-radius: 1rem;
    font-size: var(--step-3);
    cursor: pointer;
    box-shadow: ${({$selected}) => $selected ? 'var(--shadow-md)' : 'var(--shadow-sm)'};
    transform: ${({$selected}) => $selected ? 'translateY(-2px)' : 'none'};
    transition: all .15s ease;
    line-height: 1;
    padding: 0;
`;

const SuccessLoader = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
    padding: 0.75rem 0;
`;

const Spinner = styled.div`
    width: 3.75rem;
    height: 3.75rem;
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
        const pin = quizCode.replace(/\D/g, '');
        if (!name || pin.length !== 6) return;
        const avatar = EMOJI_AVATARS[emojiIdx];
        socket.emit('joinQuiz', {quizCode: pin, playerName: name, avatar});
        localStorage.setItem('name', name);
        setJoinStatus('submitting');
    };

    if (joinStatus === 'joined' || joinStatus === 'submitting') {
        return (
            <Stack>
                <SuccessLoader>
                    <AvatarPreview>{EMOJI_AVATARS[emojiIdx]}</AvatarPreview>
                    <Title>{joinStatus === 'joined' ? `You're in, ${playerName}!` : `Joining as ${playerName}…`}</Title>
                    <Subtle>Hang tight, the host will start soon.</Subtle>
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
                    <TitleSubtle>Your classmates will see this on the leaderboard.</TitleSubtle>
                    <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="123 456"
                        value={quizCode}
                        maxLength={7}
                        onChange={(e) => setQuizCode(e.target.value.replace(/[^\d ]/g, ''))}
                    />
                    <Input
                        type="text"
                        autoFocus
                        placeholder={randomPseudo}
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        maxLength={20}
                    />
                    {joinStatus === 'error' && <ErrorText>Ooopsie! looks like this quiz doesn't exist.</ErrorText>}
                    <Footer>
                        <span/>
                        <Button
                            type="button"
                            $variant="primary"
                            disabled={!playerName.trim() || quizCode.replace(/\D/g, '').length !== 6}
                            onClick={() => setStep('avatar')}
                        >
                            Continue →
                        </Button>
                    </Footer>
                </>
            )}
            {step === 'avatar' && (
                <>
                    <Title>Pick your buddy</Title>
                    <TitleSubtle>You can change this later.</TitleSubtle>
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
                    {joinStatus === 'error' && <ErrorText>Ooopsie! looks like this quiz doesn't exist.</ErrorText>}
                    <Footer>
                        <Button type="button" $variant="ghost" onClick={() => setStep('name')}>← Back</Button>
                        <Button type="button" $variant="primary" onClick={submit}>
                            Join game →
                        </Button>
                    </Footer>
                </>
            )}
        </Stack>
    );
};

export default QuizJoinForm;
