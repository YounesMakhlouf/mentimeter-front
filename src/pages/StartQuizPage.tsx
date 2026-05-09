import {useEffect, useState} from "react";
import styled from "styled-components";
import {socket, Participant} from "../socket.ts";
import {Navigate, useLocation, useNavigate} from "react-router";
import {Card, GhostButton, XLargeButton} from "../design/styled.ts";
import {GameCode, Logo, ShapeField} from "../design/primitives.tsx";

const SESSION_KEY = 'startquiz:sessionCode';

const Page = styled.div`
    position: relative;
    min-height: 100vh;
    overflow-x: hidden;
    background: var(--paper);
`;

const Header = styled.header`
    position: relative;
    padding: 18px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 2;
`;

const Wrap = styled.div`
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1fr;
    gap: 32px;
    padding: 16px 24px 24px;
    max-width: 1320px;
    margin: 0 auto;
    min-height: calc(100vh - 80px);

    @media (min-width: 900px) {
        grid-template-columns: 1.2fr 1fr;
        padding: 16px 48px 32px;
    }
`;

const CodePanel = styled(Card)`
    padding: 36px;
    display: flex;
    flex-direction: column;
    gap: 22px;
    background: var(--card);
`;

const SectionLabel = styled.div`
    font-weight: 700;
    font-size: 14px;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--ink-mute);
`;

const PinLabel = styled.div`
    font-weight: 700;
    font-size: 14px;
    color: var(--ink-mute);
`;

const ParticipantPanel = styled(Card)`
    padding: 24px;
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
    margin-bottom: 12px;
`;

const PanelTitle = styled.h2`
    font-size: 28px;
    color: var(--paper);
`;

const Counter = styled.span`
    font-family: var(--display);
    font-variant-numeric: tabular-nums;
    font-size: 32px;
    font-weight: 800;
`;

const PartGrid = styled.div`
    flex: 1;
    overflow: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 12px;
    align-content: flex-start;
`;

const PartCell = styled.div`
    background: rgba(255, 255, 255, .08);
    border-radius: 16px;
    padding: 12px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
`;

const PartFace = styled.div`
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: var(--paper);
    color: var(--ink);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    border: 2.5px solid var(--paper);
`;

const PartName = styled.div`
    font-weight: 600;
    font-size: 13px;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    white-space: nowrap;
`;

const Empty = styled.div`
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px 0;
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
                <div style={{display: 'flex', gap: 10}}>
                    <GhostButton onClick={() => navigate('/home')}>End game</GhostButton>
                </div>
            </Header>
            <Wrap>
                <CodePanel>
                    <SectionLabel>Quiz session</SectionLabel>
                    <div>
                        <PinLabel>Join at <span style={{color: 'var(--ink)'}}>quizup.live</span></PinLabel>
                        <div style={{marginTop: 6}}>
                            <PinLabel>Game PIN</PinLabel>
                            <GameCode code={sessionCode} size={64}/>
                        </div>
                    </div>
                    <p style={{color: 'var(--ink-mute)', fontSize: 14, lineHeight: 1.4}}>
                        Players open <b style={{color: 'var(--ink)'}}>localhost:5173</b> and enter this code to join.
                    </p>
                    <div style={{flex: 1}}/>
                    <XLargeButton
                        onClick={handleStartQuiz}
                        style={{
                            background: 'var(--brand)',
                            color: 'var(--brand-ink)',
                            width: '100%',
                            justifyContent: 'center',
                        }}
                    >
                        Start now ({participants.length}) →
                    </XLargeButton>
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

