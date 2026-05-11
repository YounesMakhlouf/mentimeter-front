import {useEffect, useRef, useState} from "react";
import styled from "styled-components";
import {Navigate, useLocation, useNavigate} from "react-router";
import {socket, QuestionPayload, Participant} from '../socket.ts';
import {Avatar, Card, Chip, OPT_META, ShapeIcon} from "../design";

const QUIZ_CODE_KEY = 'qspage:quizCode';
const QUESTION_TIME = 10; // seconds — matches the existing 10s server fallback timeout

const Page = styled.div`
    height: 100vh;
    background: var(--paper);
    color: var(--ink);
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const TopBar = styled.header`
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const PlayerInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 0.625rem;
`;

const Body = styled.div`
    flex: 1;
    padding: 0.75rem 1.5rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.125rem;
    max-width: 50rem;
    margin: 0 auto;
    width: 100%;
`;

const QuestionCard = styled(Card)`
    padding: 1.375rem;
    position: relative;
`;

const TimeBar = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 0.375rem;
    background: rgba(0, 0, 0, .08);
    border-top-left-radius: 1.375rem;
    border-top-right-radius: 1.375rem;
    overflow: hidden;
`;

const TimeFill = styled.div<{$pct: number; $low: boolean}>`
    height: 100%;
    width: ${({$pct}) => $pct * 100}%;
    background: ${({$low}) => $low ? 'var(--opt-a)' : 'var(--opt-d)'};
    transition: width 1s linear;
`;

const TimeChip = styled.div<{$low: boolean}>`
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    background: ${({$low}) => $low ? 'var(--opt-a)' : 'var(--ink)'};
    color: var(--paper);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--step-0);
    font-weight: 800;
    font-family: var(--display);
    font-variant-numeric: tabular-nums;
    animation: ${({$low}) => $low ? 'pulse-ring 1s ease-out infinite' : 'none'};
`;

const QuestionHeading = styled.h2`
    font-family: var(--display);
    font-size: var(--step-2);
    line-height: 1.15;
    margin-top: 0.75rem;
`;

const OptionsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    flex: 1;
`;

const OptionTile = styled.button<{$bg: string; $ink: string; $selected: boolean; $dim: boolean}>`
    background: ${({$bg}) => $bg};
    color: ${({$ink}) => $ink};
    border: 2.5px solid var(--ink);
    border-radius: var(--r-lg);
    cursor: pointer;
    font-family: inherit;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 1.125rem;
    box-shadow: var(--shadow-md);
    opacity: ${({$dim}) => $dim ? 0.35 : 1};
    transform: ${({$selected}) => $selected ? 'scale(.98)' : 'none'};
    transition: all .15s ease;
    text-align: left;
    min-height: 7.5rem;
`;

const OptionLabel = styled.span`
    font-size: var(--step-0);
    font-weight: 700;
    line-height: 1.2;
`;

const Spinner = styled.div`
    width: 5.5rem;
    height: 5.5rem;
    border-radius: 50%;
    border: 6px solid var(--ink);
    border-top-color: transparent;
    animation: spin-slow 1s linear infinite;
`;

const Centered = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.125rem;
    text-align: center;
`;

export default function QuestionPage() {
    const [questions, setQuestions] = useState<QuestionPayload[]>([]);
    const [questionNumber, setQuestionNumber] = useState(0);
    const [picked, setPicked] = useState<number | null>(null);
    const [time, setTime] = useState(QUESTION_TIME);
    const [phase, setPhase] = useState<'answer' | 'wait'>('answer');
    const isAnsweringRef = useRef(false);
    const navigate = useNavigate();
    const location = useLocation();
    const code: string | null = location.state?.payload?.quizCode ?? sessionStorage.getItem(QUIZ_CODE_KEY);
    const playerName = localStorage.getItem('name') || 'Player';

    useEffect(() => {
        if (code) sessionStorage.setItem(QUIZ_CODE_KEY, code);
    }, [code]);

    useEffect(() => {
        if (!code) return;
        socket.emit("sendQuestion", {quizCode: code, questionNumber: 0});

        let timer: ReturnType<typeof setTimeout> | undefined;

        const onQuestion = (q: QuestionPayload) => {
            isAnsweringRef.current = false;
            setPicked(null);
            setPhase('answer');
            setTime(QUESTION_TIME);
            setQuestions((prev) => [...prev, q]);
            setQuestionNumber(q.questionNumber);

            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                if (!isAnsweringRef.current) {
                    socket.emit("getAnswer", {
                        quizCode: code,
                        answer: "",
                        questionNumber: q.questionNumber,
                        playerPseudo: playerName,
                    });
                }
            }, QUESTION_TIME * 1000);
        };

        const onEndQuiz = (payload: Participant[]) => {
            navigate('/leaderboard', {state: {payload}});
        };

        socket.on('question', onQuestion);
        socket.on('endQuiz', onEndQuiz);

        return () => {
            if (timer) clearTimeout(timer);
            socket.off('question', onQuestion);
            socket.off('endQuiz', onEndQuiz);
        };
    }, [code, navigate, playerName]);

    // Countdown ticker
    useEffect(() => {
        if (phase !== 'answer') return;
        const t = setInterval(() => setTime((s) => Math.max(0, s - 1)), 1000);
        return () => clearInterval(t);
    }, [phase]);

    if (!code) {
        return <Navigate to="/" replace/>;
    }

    const currentQuestion = questions.find((q) => q.questionNumber === questionNumber);
    const questionText = currentQuestion?.question.question;
    const options = currentQuestion?.question.options;

    const onPick = (idx: number, label: string) => {
        if (picked !== null) return;
        setPicked(idx);
        setPhase('wait');
        isAnsweringRef.current = true;
        socket.emit('getAnswer', {
            quizCode: code,
            answer: label,
            questionNumber,
            playerPseudo: playerName,
        });
    };

    if (!currentQuestion) {
        return (
            <Page>
                <Centered>
                    <Spinner/>
                    <h2 style={{fontSize: 'var(--step-2)'}}>Waiting for the host…</h2>
                </Centered>
            </Page>
        );
    }

    return (
        <Page>
            <TopBar>
                <PlayerInfo>
                    <Avatar name={playerName} emoji="🎲" size={36}/>
                    <div>
                        <div style={{fontWeight: 700, fontSize: 'var(--step--1)'}}>{playerName}</div>
                        <div style={{color: 'var(--ink-mute)', fontSize: 'var(--step--2)'}}>Live game</div>
                    </div>
                </PlayerInfo>
                <Chip>Q {(questionNumber + 1).toString().padStart(2, '0')}</Chip>
            </TopBar>
            <Body>
                {phase === 'answer' && (
                    <>
                        <QuestionCard>
                            <TimeBar>
                                <TimeFill $pct={time / QUESTION_TIME} $low={time < 6}/>
                            </TimeBar>
                            <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.25rem', marginTop: '0.375rem'}}>
                                <TimeChip $low={time < 6}>{time}</TimeChip>
                                <span style={{color: 'var(--ink-mute)', fontSize: 'var(--step--2)', fontWeight: 600}}>seconds left</span>
                            </div>
                            <QuestionHeading>{questionText}</QuestionHeading>
                        </QuestionCard>
                        <OptionsGrid>
                            {options?.map((option, i) => {
                                const m = OPT_META[i] ?? OPT_META[i % 4];
                                const sel = picked === i;
                                return (
                                    <OptionTile
                                        key={i}
                                        type="button"
                                        $bg={m.colorVar}
                                        $ink={m.inkVar}
                                        $selected={sel}
                                        $dim={picked !== null && !sel}
                                        disabled={picked !== null}
                                        onClick={() => onPick(i, option.label)}
                                    >
                                        <ShapeIcon
                                            kind={m.shape}
                                            size={42}
                                            color={m.inkVar === '#ffffff' ? 'rgba(255,255,255,.95)' : 'rgba(0,0,0,.85)'}
                                        />
                                        <OptionLabel>{option.label}</OptionLabel>
                                    </OptionTile>
                                );
                            })}
                        </OptionsGrid>
                    </>
                )}
                {phase === 'wait' && picked !== null && (
                    <Centered>
                        <Spinner/>
                        <h2>Locked in!</h2>
                        <p style={{color: 'var(--ink-mute)', fontSize: 'var(--step--1)', maxWidth: 320}}>
                            Hang tight — we'll reveal the answer when everyone's in.
                        </p>
                        {options?.[picked] && (
                            <Card style={{padding: '0.625rem 1.125rem', display: 'flex', alignItems: 'center', gap: 10}}>
                                <ShapeIcon kind={OPT_META[picked].shape} size={24} color={OPT_META[picked].colorVar}/>
                                <span style={{fontWeight: 700}}>You picked: {options[picked].label}</span>
                            </Card>
                        )}
                    </Centered>
                )}
            </Body>
        </Page>
    );
}
