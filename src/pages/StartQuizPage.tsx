import {useEffect, useState} from "react";
import styled from "styled-components";
import {Button} from "../Components/Component.tsx";
import {socket, Participant} from "../socket.ts";
import {Link, Navigate, useLocation} from "react-router";

const SESSION_KEY = 'startquiz:sessionCode';

const Page = styled.div`
    text-align: center;
    margin-top: 1rem;
`;

const Code = styled.p`
    font-size: 1.25rem;
    font-weight: bold;
    padding: 0.5em 1em;
    background-color: #e0f7fa;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const ButtonRow = styled.div`
    display: flex;
    justify-content: center;
    gap: 1em;
`;

const ParticipantBoard = styled.div`
    background-color: #eeeeee;
    border-radius: 5%;
    min-height: 50vh;
    display: flex;
    flex-wrap: wrap;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
`;

const Circle = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 1rem;
`;

const Avatar = styled.img`
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin-bottom: 0.5rem;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
`;

const ParticipantCircle = ({avatar, playerName}: Participant) => (
    <Circle>
        <Avatar src={avatar} alt="Participant Avatar"/>
        <div className="pseudonym">{playerName}</div>
    </Circle>
);

export default function StartQuizPage() {
    const location = useLocation();
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
        <Page className="flow wrapper">
            <h1>Join the Quiz!</h1>
            <h2>Here's the code to share with your participants:</h2>
            <Code>{sessionCode}</Code>
            <ButtonRow>
                <Link to="/home"><Button>Cancel</Button></Link>
                <Button onClick={handleStartQuiz}>Start now</Button>
            </ButtonRow>
            <ParticipantBoard>
                {participants.map((participant, index) => (
                    <ParticipantCircle key={index} {...participant} />
                ))}
            </ParticipantBoard>
        </Page>
    );
}
