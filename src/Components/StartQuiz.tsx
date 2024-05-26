import {CSSProperties, useEffect, useState} from "react";
import {Button} from "./Component.tsx";
import {socket} from "../socket";
import {Link, useLocation} from "react-router-dom";

export default function StartQuiz() {
    const location = useLocation();
    console.log(location)
    const sessionCode = location.state?.sessionCode || "N/A";
    const [participants, setParticipants] = useState([]);

    const avatarStyle = {
        width: "50px", height: "50px", borderRadius: " 50%", marginBottom: "0.5rem"
    }

    const startQuizStyle: CSSProperties = {
        textAlign: "center", marginTop: "50px"
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
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
        marginTop: "2em"
    }

    const ParticipantCircle = ({avatar, playerName}) => (<div style={participantCircleStyle}>
        <img src={avatar} alt="Participant Avatar" style={avatarStyle}/>
        <div className="pseudonym">{playerName}</div>
    </div>);

    useEffect(() => {
        socket.on('playerJoined', (newParticipant) => {
            console.log(newParticipant)
            setParticipants((prevParticipants) => [...prevParticipants, newParticipant]);
        });

        return () => {
            socket.off('playerJoined');
        };
    }, []);

    return (<div style={startQuizStyle} className={"flow wrapper"}>
        <h1>Join the Quiz!</h1>
        <h2>Here's the code to share with your participants:</h2>
        {/*TODO: change this to be the real code*/}
        <p>{sessionCode}</p>
        <div>
            <Button style={{marginRight: "1em"}}><Link to="/home">Cancel</Link></Button>
            <Button>Start now</Button>
        </div>
        <div style={participantBoardStyle}>
            {participants.map((participant, index) => (<ParticipantCircle key={index} {...participant} />))}
        </div>
    </div>)
}