import {useEffect, useState} from "react";
import styled from "styled-components";
import {socket, type Participant, type QuestionPayload} from "../socket.ts";
import {Navigate, useLocation, useNavigate} from "react-router";
import {Button, Card, GameCode, Logo, Page, ShapeField} from "../design";

const SESSION_KEY = 'startquiz:sessionCode';

const Header = styled.header.attrs({className: 'wrapper'})`
    --wrapper-max: 82.5rem;
    position: relative;
    padding-block: 1.125rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 2;
`;

const Wrap = styled.div.attrs({className: 'wrapper'})`
    --wrapper-max: 82.5rem;
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--gap-6);
    padding-block: 1rem 1.5rem;
    min-height: calc(100vh - 5rem);

    @media (min-width: 56.25rem) {
        grid-template-columns: 1.2fr 1fr;
        padding-block: 1rem 2rem;
    }
`;

const CodePanel = styled(Card)`
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: var(--gap-4);
    background: var(--card);

    @media (min-width: 30em) {
        padding: 2.25rem;
        gap: var(--gap-5);
    }
`;

const StartButton = styled(Button).attrs({$variant: 'primary' as const, $size: 'xl' as const})`
    width: 100%;
    justify-content: center;
    margin-top: auto;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: var(--gap-3);
`;

const JoinHint = styled.p`
    color: var(--ink-mute);
    font-size: var(--step--1);
    line-height: 1.4;

    b {
        color: var(--ink);
    }
`;

const SectionLabel = styled.div`
    font-weight: 700;
    font-size: var(--step--1);
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--ink-mute);
`;

const PinLabel = styled.div`
    font-weight: 700;
    font-size: var(--step--1);
    color: var(--ink-mute);
`;

const ParticipantPanel = styled(Card)`
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--ink);
    color: var(--paper);
`;

const PanelHeader = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 0.75rem;
`;

const PanelTitle = styled.h2`
    font-size: var(--step-2);
    color: var(--paper);
`;

const Counter = styled.span`
    font-family: var(--display);
    font-variant-numeric: tabular-nums;
    font-size: var(--step-3);
    font-weight: 800;
`;

const PartGrid = styled.div`
    flex: 1;
    overflow: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(6.875rem, 1fr));
    gap: var(--gap-3);
    align-content: flex-start;
`;

const PartCell = styled.div`
    background: rgba(255, 255, 255, .08);
    border-radius: 1rem;
    padding: 0.75rem 0.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--gap-2);
`;

const PartFace = styled.div`
    width: 3.25rem;
    height: 3.25rem;
    border-radius: 50%;
    background: var(--paper);
    color: var(--ink);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--step-2);
    border: 2.5px solid var(--paper);
`;

const PartName = styled.div`
    font-weight: 600;
    font-size: var(--step--2);
    text-align: center;
`;

const Empty = styled.div`
    grid-column: 1 / -1;
    text-align: center;
    padding: 3.75rem 0;
    opacity: 0.7;
`;

export default function StartQuizPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [participants, setParticipants] = useState<Participant[]>([]);
    const sessionCode: string | null = location.state?.sessionCode ?? sessionStorage.getItem(SESSION_KEY);

    useEffect(() => {
        if (sessionCode) sessionStorage.setItem(SESSION_KEY, sessionCode);
    }, [sessionCode]);

    useEffect(() => {
        const onPlayerJoined = (newParticipant: Participant) => {
            setParticipants((prev) => [...prev, newParticipant]);
        };
        socket.on('playerJoined', onPlayerJoined);
        return () => {
            socket.off('playerJoined', onPlayerJoined);
        };
    }, []);

    function handleStartQuiz() {
        if (!sessionCode) return;
        // Capture the first 'question' event here so PresenterPage gets the
        // payload via location.state — without this, the event fires before
        // PresenterPage has mounted its listener and the question is lost.
        const onFirstQuestion = (payload: QuestionPayload) => {
            socket.off('question', onFirstQuestion);
            navigate('/present', {
                state: {sessionCode, playerCount: participants.length, payload},
            });
        };
        socket.on('question', onFirstQuestion);
        socket.emit('sendQuestion', {quizCode: sessionCode, questionNumber: 0});
    }

    if (!sessionCode) {
        return <Navigate to="/home" replace/>;
    }

    return (
        <Page>
            <ShapeField density={10} opacity={0.12} seed={11}/>
            <Header>
                <Logo size={26}/>
                <HeaderActions>
                    <Button $variant="ghost" onClick={() => navigate('/home')}>End game</Button>
                </HeaderActions>
            </Header>
            <Wrap>
                <CodePanel>
                    <SectionLabel>Quiz session</SectionLabel>
                    <div>
                        <PinLabel>Game PIN</PinLabel>
                        <GameCode code={sessionCode}/>
                    </div>
                    <JoinHint>
                        Players open <b>localhost:5173</b> and enter this code to join.
                    </JoinHint>
                    <StartButton onClick={handleStartQuiz} disabled={participants.length === 0}>
                        {participants.length === 0
                            ? 'Waiting for players…'
                            : `Start now (${participants.length}) →`}
                    </StartButton>
                </CodePanel>

                <ParticipantPanel>
                    <PanelHeader>
                        <PanelTitle>In the room</PanelTitle>
                        <Counter>{participants.length}</Counter>
                    </PanelHeader>
                    <PartGrid>
                        {participants.map((p, i) => (
                            <PartCell key={i} className="pop-in">
                                <PartFace>{p.avatar?.length === 1 || (p.avatar && [...p.avatar].length <= 2) ? p.avatar : '🎲'}</PartFace>
                                <PartName>{p.playerName}</PartName>
                            </PartCell>
                        ))}
                        {participants.length === 0 && (
                            <Empty>Waiting for players to join…</Empty>
                        )}
                    </PartGrid>
                </ParticipantPanel>
            </Wrap>
        </Page>
    );
}

