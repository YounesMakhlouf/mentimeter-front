import {useEffect, useRef, useState} from "react";
import styled from "styled-components";
import {Navigate, useLocation, useNavigate} from "react-router";
import {socket, QuestionPayload, Participant} from '../socket.ts';
import {Avatar, Card, Chip, OPT_META, ShapeIcon} from "../design";
import {local, session} from '../storage';

const QUESTION_TIME = 10; // seconds — matches the existing 10s server fallback timeout

const Page = styled.div`
    min-height: 100vh;
    background: var(--paper);
    color: var(--ink);
    display: flex;
    flex-direction: column;
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
    gap: var(--gap-3);
`;

const Body = styled.div.attrs({className: 'wrapper'})`
    --wrapper-max: 50rem;
    flex: 1;
    padding-block: 0.75rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: var(--gap-4);
`;

const QuestionCard = styled(Card)`
    padding: 1.375rem;
    position: relative;
    /* Clip the absolutely-positioned TimeBar to the card's rounded shape
       instead of trying to match the radius by hand (which was always going
       to be off by the 2.5px border width). */
    overflow: hidden;
`;

const TimeBar = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 0.375rem;
    background: rgba(0, 0, 0, .08);
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
    font-size: var(--step-2);
    line-height: 1.15;
    margin-top: 0.75rem;
`;

const OptionsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--gap-3);
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
    gap: var(--gap-3);
    padding: 1.125rem;
    box-shadow: var(--shadow-md);
    opacity: ${({$dim}) => $dim ? 0.35 : 1};
    transform: ${({$selected}) => $selected ? 'scale(.98)' : 'none'};
    transition: all .15s ease;
    text-align: left;
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
    gap: var(--gap-4);
    text-align: center;
`;

const WaitingTitle = styled.h2`
    font-size: var(--step-2);
`;

const PlayerName = styled.div`
    font-weight: 700;
    font-size: var(--step--1);
`;

const PlayerSub = styled.div`
    color: var(--ink-mute);
    font-size: var(--step--2);
`;

const TimeRow = styled.div`
    display: flex;
    align-items: center;
    gap: var(--gap-3);
    margin: 0.375rem 0 0.25rem;
`;

const SecondsLabel = styled.span`
    color: var(--ink-mute);
    font-size: var(--step--2);
    font-weight: 600;
`;

const WaitHint = styled.p`
    color: var(--ink-mute);
    font-size: var(--step--1);
    max-width: 20rem;
`;

const PickedCard = styled(Card)`
    padding: 0.625rem 1.125rem;
    display: flex;
    align-items: center;
    gap: var(--gap-3);
`;

const PickedLabel = styled.span`
    font-weight: 700;
`;

export default function QuestionPage() {
    const location = useLocation();
    const initialQuestion: QuestionPayload | undefined = location.state?.payload;
    const [questions, setQuestions] = useState<QuestionPayload[]>(initialQuestion ? [initialQuestion] : []);
    const [questionNumber, setQuestionNumber] = useState(initialQuestion?.questionNumber ?? 0);
    const [picked, setPicked] = useState<number | null>(null);
    const [time, setTime] = useState(QUESTION_TIME);
    const [phase, setPhase] = useState<'answer' | 'wait'>('answer');
    const isAnsweringRef = useRef(false);
    const navigate = useNavigate();
    const code: string | null = location.state?.payload?.quizCode ?? sessionStorage.getItem(session.playerCode);
    const playerName = localStorage.getItem(local.name) || 'Player';

    useEffect(() => {
        if (code) sessionStorage.setItem(session.playerCode, code);
    }, [code]);

    useEffect(() => {
        if (!code) return;

        let timer: ReturnType<typeof setTimeout> | undefined;

        const startAutoSubmit = (qNum: number) => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                if (!isAnsweringRef.current) {
                    socket.emit("getAnswer", {
                        quizCode: code,
                        answer: "",
                        questionNumber: qNum,
                        playerPseudo: playerName,
                    });
                }
            }, QUESTION_TIME * 1000);
        };

        const onQuestion = (q: QuestionPayload) => {
            isAnsweringRef.current = false;
            setPicked(null);
            setPhase('answer');
            setTime(QUESTION_TIME);
            setQuestions((prev) => [...prev, q]);
            setQuestionNumber(q.questionNumber);
            startAutoSubmit(q.questionNumber);
        };

        const onEndQuiz = (payload: Participant[]) => {
            navigate('/leaderboard', {state: {payload}});
        };

        // Host disconnected — bail out of the game gracefully. Without this
        // the player sits forever on the current question (timer keeps
        // ticking, getAnswer emits go to a dead session, no endQuiz arrives).
        const onSessionEnded = () => {
            navigate('/', {replace: true});
        };

        socket.on('question', onQuestion);
        socket.on('endQuiz', onEndQuiz);
        socket.on('sessionEnded', onSessionEnded);

        // WelcomePage consumed the first 'question' event during navigation,
        // so we seeded it into state above; kick off its auto-submit timer.
        if (initialQuestion) startAutoSubmit(initialQuestion.questionNumber);

        return () => {
            if (timer) clearTimeout(timer);
            socket.off('question', onQuestion);
            socket.off('endQuiz', onEndQuiz);
            socket.off('sessionEnded', onSessionEnded);
        };
    }, [code, navigate, playerName, initialQuestion]);

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
                    <WaitingTitle>Waiting for the host…</WaitingTitle>
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
                        <PlayerName>{playerName}</PlayerName>
                        <PlayerSub>Live game</PlayerSub>
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
                            <TimeRow>
                                <TimeChip $low={time < 6}>{time}</TimeChip>
                                <SecondsLabel>seconds left</SecondsLabel>
                            </TimeRow>
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
                        <WaitHint>
                            Hang tight — we'll reveal the answer when everyone's in.
                        </WaitHint>
                        {options?.[picked] && (
                            <PickedCard>
                                <ShapeIcon kind={OPT_META[picked].shape} size={24} color={OPT_META[picked].colorVar}/>
                                <PickedLabel>You picked: {options[picked].label}</PickedLabel>
                            </PickedCard>
                        )}
                    </Centered>
                )}
            </Body>
        </Page>
    );
}
