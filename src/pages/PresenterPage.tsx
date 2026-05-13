import {useEffect, useState} from 'react';
import styled from 'styled-components';
import {Navigate, useLocation, useNavigate} from 'react-router';
import {
    socket,
    type AnswerReceivedPayload,
    type Participant,
    type QuestionPayload,
} from '../socket.ts';
import {Button, Chip, Logo, OPT_META, ShapeField, ShapeIcon} from '../design';

const SESSION_KEY = 'present:sessionCode';
const QUESTION_TIME = 10;

type Phase = 'question' | 'reveal';

const Stage = styled.div`
    position: relative;
    height: 100vh;
    overflow: hidden;
    background: var(--ink);
    color: var(--paper);
    display: flex;
    flex-direction: column;
`;

const TopBar = styled.header`
    position: relative;
    z-index: 2;
    padding: 1rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--gap-4);
    flex-wrap: wrap;
`;

const PaperChip = styled(Chip)`
    background: transparent;
    color: var(--paper);
    border-color: var(--paper);
`;

const Pulse = styled.span`
    width: 0.5rem;
    height: 0.5rem;
    background: var(--opt-d);
    border-radius: 50%;
    display: inline-block;
    animation: pulse-ring 1.4s ease-out infinite;
`;

const PinChip = styled(Chip)`
    background: var(--paper);
    color: var(--ink);
    font-family: var(--display);
    font-variant-numeric: tabular-nums;
    font-weight: 800;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: var(--gap-3);
`;

const GhostInk = styled(Button).attrs({$variant: 'ghost' as const})`
    color: var(--paper);
    &:hover { background: rgba(255, 255, 255, .08); }
`;

const Body = styled.div`
    position: relative;
    z-index: 2;
    flex: 1;
    padding: 1.5rem 2rem 2rem;
    display: grid;
    grid-template-rows: auto 1fr auto;
    gap: var(--gap-5);
    min-height: 0;

    @media (min-width: 50rem) {
        padding: 1.5rem 4rem 3rem;
    }
`;

const QuestionMeta = styled.div`
    display: flex;
    align-items: center;
    gap: var(--gap-5);
`;

const QLabel = styled.div`
    font-family: var(--display);
    font-size: var(--step--1);
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, .5);
`;

const TimerRing = styled.div`
    position: relative;
    width: 6rem;
    height: 6rem;
    flex: none;
`;

const TimerText = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--display);
    font-variant-numeric: tabular-nums;
    font-size: var(--step-4);
    font-weight: 800;
    color: var(--paper);
`;

const Heart = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: var(--gap-6);
    min-height: 0;
`;

const QuestionHeading = styled.h1`
    font-size: clamp(2rem, 5vw, 4.5rem);
    color: var(--paper);
    max-width: 70rem;
    line-height: 1.05;
`;

const Bars = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--gap-4);

    @media (min-width: 50rem) {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        align-items: end;
        height: 15rem;
    }
`;

const BarColumn = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--gap-2);
    min-width: 0;

    @media (min-width: 50rem) {
        height: 100%;
        justify-content: flex-end;
    }
`;

const Count = styled.div<{$dim: boolean}>`
    font-family: var(--display);
    font-variant-numeric: tabular-nums;
    font-size: var(--step-1);
    text-align: center;
    color: ${({$dim}) => $dim ? 'rgba(255,255,255,.4)' : 'var(--paper)'};
`;

const BarTrack = styled.div`
    display: none;

    @media (min-width: 50rem) {
        display: flex;
        align-items: flex-end;
        flex: 1;
        position: relative;
    }
`;

const BarFill = styled.div<{$bg: string; $pct: number; $show: boolean; $dim: boolean}>`
    width: 100%;
    height: ${({$pct, $show}) => $show ? `${Math.max($pct * 100, 6)}%` : '6%'};
    background: ${({$bg}) => $bg};
    border: 3px solid var(--paper);
    border-radius: 1rem;
    transition: height .8s cubic-bezier(.34, 1.56, .64, 1);
    opacity: ${({$dim}) => $dim ? 0.35 : 1};
    position: relative;
`;

const BarLabel = styled.div<{$bg: string; $ink: string}>`
    background: ${({$bg}) => $bg};
    color: ${({$ink}) => $ink};
    border: 2.5px solid var(--paper);
    border-radius: 0.875rem;
    padding: 0.75rem 0.875rem;
    display: flex;
    align-items: center;
    gap: var(--gap-3);
    min-width: 0;
`;

const BarText = styled.span`
    font-weight: 700;
    font-size: var(--step-0);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const CorrectFlag = styled.div`
    position: absolute;
    top: -2rem;
    left: 50%;
    transform: translateX(-50%);
    background: var(--opt-c);
    color: var(--ink);
    font-family: var(--display);
    font-weight: 800;
    font-size: var(--step--1);
    padding: 0.25rem 0.625rem;
    border: 2.5px solid var(--paper);
    border-radius: 999px;
    white-space: nowrap;
`;

const Footnote = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: rgba(255, 255, 255, .6);
    font-size: var(--step--1);
`;

const WaitingMessage = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: var(--paper);
    font-family: var(--display);
    font-size: var(--step-3);
    padding: 0 1rem;
`;

const ringPath = (pct: number) => {
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    return circumference * (1 - pct);
};

export default function PresenterPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const sessionCode: string | null = location.state?.sessionCode ?? sessionStorage.getItem(SESSION_KEY);
    const initialPlayerCount: number = location.state?.playerCount ?? 0;
    const initialQuestion: QuestionPayload | undefined = location.state?.payload;

    const [currentQuestion, setCurrentQuestion] = useState<QuestionPayload | null>(initialQuestion ?? null);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [playerCount, setPlayerCount] = useState(initialPlayerCount);
    const [time, setTime] = useState(QUESTION_TIME);
    const phase: Phase = time === 0 ? 'reveal' : 'question';

    useEffect(() => {
        if (sessionCode) sessionStorage.setItem(SESSION_KEY, sessionCode);
    }, [sessionCode]);

    useEffect(() => {
        if (!sessionCode) return;

        const onQuestion = (q: QuestionPayload) => {
            setCurrentQuestion(q);
            setCounts({});
            setTime(QUESTION_TIME);
        };

        const onAnswer = (payload: AnswerReceivedPayload) => {
            setCounts((prev) => ({
                ...prev,
                [payload.answer]: (prev[payload.answer] ?? 0) + 1,
            }));
        };

        const onPlayerJoined = () => {
            setPlayerCount((n) => n + 1);
        };

        const onEndQuiz = (payload: Participant[]) => {
            navigate('/leaderboard', {state: {payload}});
        };

        socket.on('question', onQuestion);
        socket.on('answerReceived', onAnswer);
        socket.on('playerJoined', onPlayerJoined);
        socket.on('endQuiz', onEndQuiz);

        return () => {
            socket.off('question', onQuestion);
            socket.off('answerReceived', onAnswer);
            socket.off('playerJoined', onPlayerJoined);
            socket.off('endQuiz', onEndQuiz);
        };
    }, [sessionCode, navigate]);

    // Countdown ticker — resets whenever a fresh question arrives. When `time`
    // reaches 0 the derived `phase` flips to 'reveal' (no separate state).
    useEffect(() => {
        if (!currentQuestion) return;
        const id = setInterval(() => setTime((s) => Math.max(0, s - 1)), 1000);
        return () => clearInterval(id);
    }, [currentQuestion]);

    if (!sessionCode) {
        return <Navigate to="/home" replace/>;
    }

    const handleNext = () => {
        if (!currentQuestion) return;
        socket.emit('sendQuestion', {
            quizCode: sessionCode,
            questionNumber: currentQuestion.questionNumber + 1,
        });
    };

    const handleEnd = () => navigate('/home');

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const correctLabel = currentQuestion?.question.options.find((o) => o.isCorrect)?.label;

    return (
        <Stage>
            <ShapeField density={20} opacity={0.07} seed={13}/>
            <TopBar>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.875rem'}}>
                    <Logo size={22} mono/>
                    <PaperChip><Pulse/> Live · {playerCount} player{playerCount === 1 ? '' : 's'}</PaperChip>
                </div>
                <PinChip>PIN <span style={{marginLeft: '0.375rem'}}>{sessionCode}</span></PinChip>
                <HeaderActions>
                    <GhostInk onClick={handleEnd}>End</GhostInk>
                    <Button $variant="primary" onClick={handleNext} disabled={!currentQuestion}>
                        {phase === 'reveal' ? 'Next →' : 'Skip'}
                    </Button>
                </HeaderActions>
            </TopBar>

            {currentQuestion ? (
                <Body>
                    <QuestionMeta>
                        <QLabel>Question {String(currentQuestion.questionNumber + 1).padStart(2, '0')}</QLabel>
                        <div style={{flex: 1}}/>
                        <TimerRing>
                            <svg width="96" height="96" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none"
                                        stroke="rgba(255,255,255,.15)" strokeWidth="8"/>
                                <circle cx="50" cy="50" r="42" fill="none"
                                        stroke="var(--opt-c)" strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={2 * Math.PI * 42}
                                        strokeDashoffset={ringPath(time / QUESTION_TIME)}
                                        transform="rotate(-90 50 50)"
                                        style={{transition: 'stroke-dashoffset 1s linear'}}/>
                            </svg>
                            <TimerText>{time}</TimerText>
                        </TimerRing>
                    </QuestionMeta>

                    <Heart>
                        <QuestionHeading>{currentQuestion.question.question}</QuestionHeading>

                        <Bars>
                            {currentQuestion.question.options.map((o, i) => {
                                const m = OPT_META[i] ?? OPT_META[i % 4];
                                const count = counts[o.label] ?? 0;
                                const pct = total ? count / total : 0;
                                const showBar = phase === 'reveal' || total > 0;
                                const isWinner = phase === 'reveal' && o.label === correctLabel;
                                const dim = phase === 'reveal' && !isWinner;
                                return (
                                    <BarColumn key={i}>
                                        <Count $dim={dim}>{count}</Count>
                                        <BarTrack>
                                            <BarFill $bg={m.colorVar} $pct={pct} $show={showBar} $dim={dim}>
                                                {isWinner && <CorrectFlag>✓ Correct</CorrectFlag>}
                                            </BarFill>
                                        </BarTrack>
                                        <BarLabel $bg={m.colorVar} $ink={m.inkVar}>
                                            <ShapeIcon kind={m.shape} size={28}
                                                       color={m.inkVar === '#ffffff' ? 'rgba(255,255,255,.85)' : 'rgba(0,0,0,.85)'}/>
                                            <BarText>{o.label}</BarText>
                                        </BarLabel>
                                    </BarColumn>
                                );
                            })}
                        </Bars>
                    </Heart>

                    <Footnote>
                        <span>
                            {phase === 'question'
                                ? `${total}${playerCount ? ` of ${playerCount}` : ''} answered`
                                : `${total} answer${total === 1 ? '' : 's'} in`}
                        </span>
                    </Footnote>
                </Body>
            ) : (
                <WaitingMessage>Waiting for the first question…</WaitingMessage>
            )}
        </Stage>
    );
}
