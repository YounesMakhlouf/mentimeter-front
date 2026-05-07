import {socket, QuestionPayload, Participant} from '../socket.ts'
import {Navigate, useLocation, useNavigate} from "react-router";
import styled from "styled-components";
import {ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState} from "react";

function getRandomColor() {
    const min = 150;
    const max = 256;
    const r = Math.floor(Math.random() * (max - min) + min);
    const g = Math.floor(Math.random() * (max - min) + min);
    const b = Math.floor(Math.random() * (max - min) + min);
    return `rgb(${r}, ${g}, ${b})`;
}

export default function QuestionPage() {
    const [questions, setQuestions] = useState<QuestionPayload[]>([]);
    const [questionNumber, setQuestionNumber] = useState(0);
    const [answerState, setAnswerState] = useState("");
    const [isAnswering, setIsAnswering] = useState(false);
    const isAnsweringRef = useRef(false);

    const navigate = useNavigate();

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {value} = event.target;
        setAnswerState(value);
    };

    const location = useLocation();
    const code: string | undefined = location.state?.payload?.quizCode;

    const sendAnswer = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!code) return;
        socket.emit("getAnswer", {
            quizCode: code,
            answer: answerState,
            questionNumber: questionNumber,
            playerPseudo: localStorage.getItem('name')
        });
        isAnsweringRef.current = true;
        setIsAnswering(true);
    }

    useEffect(() => {
        if (!code) return;
        socket.emit("sendQuestion", {quizCode: code, questionNumber: 0});

        let timer: ReturnType<typeof setTimeout> | undefined;

        const onQuestion = (question: QuestionPayload) => {
            isAnsweringRef.current = false;
            setIsAnswering(false);
            setQuestions((prev) => [...prev, question]);
            setQuestionNumber(question.questionNumber);

            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                if (!isAnsweringRef.current) {
                    socket.emit("getAnswer", {
                        quizCode: code,
                        answer: "",
                        questionNumber: question.questionNumber,
                        playerPseudo: localStorage.getItem('name'),
                    });
                }
            }, 10000);
        };

        const onEndQuiz = (payload: Participant[]) => {
            navigate('/leaderboard', {state: {payload}});
        };

        socket.on("question", onQuestion);
        socket.on("endQuiz", onEndQuiz);

        return () => {
            if (timer) clearTimeout(timer);
            socket.off("question", onQuestion);
            socket.off("endQuiz", onEndQuiz);
        };
    }, [code, navigate]);

    const borderColors = useMemo(
        () => [getRandomColor(), getRandomColor(), getRandomColor()],
        [],
    );

    if (!code) {
        return <Navigate to="/" replace />;
    }

    const currentQuestion = questions.find(q => q.questionNumber === questionNumber);
    const question = currentQuestion?.question.question;
    const options = currentQuestion?.question.options;

    const Container = styled.div`
        background-color: #fff;
        border-radius: 10px;
        box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
        position: relative;
        margin: auto;
        margin-top: 2%;
        overflow: hidden;
        top: 10%;
        width: 500px;
        height: 600px;
        max-width: 100%;
        min-height: 400px;
    `;

    const optionStyle = {
        border: '2px solid ',
        padding: '1em',
        borderRadius: '5px',
        display: 'flex',
        alignItems: 'left',
        width: '85%',
        margin: 'auto',
        marginBottom: '1em',
    }
    const buttonStyle = {
        marginTop: '5em',
        backgroundColor: '#6C0345',
        color: 'white',
        borderRadius: '5px',
        cursor: isAnswering ? 'not-allowed' : 'pointer',
    }
    const questionStyle = {
        fontSize: '1.5em'
    }

    return (<Container>
        <div>
            <h2 style={{marginTop: '8%', marginBottom: '8%'}}>
                <span style={{color: "#6C0345"}}>Quiz</span>
                <span style={{color: "#DC6B19"}}>Up</span>
            </h2>
            <form onSubmit={sendAnswer}>
                <div>
                    <p style={questionStyle}>{question}</p>
                </div>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <div style={{marginTop: '1em'}}>
                        {options && options.map((option, index) => (
                            <div key={index} style={{...optionStyle, borderColor: borderColors[index]}}>
                                <input
                                    type="radio"
                                    id={`option${index}`}
                                    name="answer"
                                    value={option.label}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor={`option${index}`}>{option.label}</label>
                            </div>))}
                    </div>
                </div>
                <button style={buttonStyle} type="submit" disabled={isAnswering}>Submit Answer</button>
            </form>
        </div>
    </Container>)
}