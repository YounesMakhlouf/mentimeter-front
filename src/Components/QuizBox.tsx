import {CSSProperties, useState} from "react";
import {Button} from "./Component.tsx";
import {socket} from '../socket.ts'
import type {Quiz} from '../loaders.ts';


export default function QuizBox(props: {quiz: Quiz}) {
    const [isHovered, setIsHovered] = useState(false);

    const mainQuizBoxStyle: CSSProperties = {
        borderRadius: "0.5em",
        fontWeight: "bold",
        border: "1px solid #D3D3D3",
        minHeight: "14em",
        transition: 'box-shadow 0.3s ease',
        boxShadow: isHovered ? ' 0 0 11px rgba(33,33,33,.2)' : 'none',
        backgroundImage: 'url("/assets/question-marks.jpg")',
        backgroundSize: "cover",
        backgroundRepeat: 'repeat',
        display: "flex",
        flexDirection: "column",
        justifyContent: "center"
    }
    const handleButtonClick = () => {
        socket.emit('createQuizSession', { quizId: props.quiz.id })
    }

    return (<article className="flow">
        <div style={mainQuizBoxStyle}
             onMouseEnter={() => setIsHovered(true)}
             onMouseLeave={() => setIsHovered(false)}
        >
            <p style={{fontSize: "1.5rem"}}>{props.quiz.name}</p>
        </div>
        <Button onClick={handleButtonClick}>
            Start Quiz
        </Button>
    </article>)
}