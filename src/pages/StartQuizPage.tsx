import {CSSProperties, useEffect, useState} from "react";
import {Button} from "../Components/Component.tsx";
import {socket, Participant} from "../socket.ts";
import {Link, Navigate, useLocation} from "react-router";

export default function StartQuizPage() {
    const location = useLocation();
    const [participants, setParticipants] = useState<Participant[]>([]);
    const sessionCode: string | undefined = location.state?.sessionCode;

    const avatarStyle = {
        width: "50px",
        height: "50px",
        borderRadius: " 50%",
        marginBottom: "0.5rem",
        boxShadow: "0 0 5px rgba(0, 0, 0, 0.3)"
    }

    const startQuizStyle: CSSProperties = {
        textAlign: "center", marginTop: "1rem"
    }
    const participantCircleStyle: CSSProperties = {
        display: "flex", flexDirection: "column", alignItems: "center", margin: "1rem"
    }

    const participantBoardStyle: CSSProperties = {
        backgroundColor: "#eeeeee",
        borderRadius: '5%',
        minHeight: "50vh",
        display: "flex",
        flexWrap: "wrap",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)"
    };
    const codeStyle: CSSProperties = {
        fontSize: "1.25rem",
        fontWeight: "bold",
        padding: "0.5em 1em",
        backgroundColor: "#e0f7fa",
        borderRadius: "5px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)"
    };
    const buttonContainerStyle: CSSProperties = {
        display: "flex", justifyContent: "center", gap: "1em"
    };
    const ParticipantCircle = ({avatar, playerName}: Participant) => (<div style={participantCircleStyle}>
        <img src={avatar} alt="Participant Avatar" style={avatarStyle}/>
        <div className="pseudonym">{playerName}</div>
    </div>);

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
        return <Navigate to="/home" replace />;
    }

    return (<div style={startQuizStyle} className={"flow wrapper"}>
            <h1>Join the Quiz!</h1>
            <h2>Here's the code to share with your participants:</h2>
            <p style={codeStyle}>{sessionCode}</p>
            <div style={buttonContainerStyle}>
                <Link to="/home"><Button>Cancel</Button></Link>
                <Button onClick={handleStartQuiz}>Start now</Button>
            </div>
            <div style={participantBoardStyle}>
                {participants.map((participant, index) => (<ParticipantCircle key={index} {...participant} />))}
            </div>
        </div>
        // TODO: when the user closes the popup, disconnect him and remove him from the board
    )
}

