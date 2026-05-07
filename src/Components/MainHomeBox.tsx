import QuizBox from "./QuizBox.tsx";
import CreateQuizPopup from "./CreateQuizPopup.tsx";
import {useEffect} from "react";
import {useLoaderData, useNavigate} from "react-router";
import {socket} from "../socket.ts";
import type {Quiz} from "../loaders.ts";

export default function MainHomeBox(props: {name: string}) {
    const {quizzes} = useLoaderData() as {quizzes: Quiz[]};
    const navigate = useNavigate();

    useEffect(() => {
        const onSuccess = (sessionCode: string) => {
            navigate('/startquiz', {state: {sessionCode}});
        };
        socket.on('QuizCreationSuccess', onSuccess);
        return () => {
            socket.off('QuizCreationSuccess', onSuccess);
        };
    }, [navigate])

    return (<div className="flow">
        <h1 style={{color: "#6C0345"}}>
            Welcome back, {props.name} !
        </h1>
        <CreateQuizPopup/>
        <h2 style={{color: "#F5DD61", fontSize: "2rem"}}>Revisit your old quizzes</h2>
        <div className="grid">
            {quizzes.map((quiz, index) => (<QuizBox key={index} quiz={quiz}/>))}
        </div>
    </div>)
}
