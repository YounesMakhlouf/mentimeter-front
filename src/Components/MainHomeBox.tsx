import QuizBox from "./QuizBox.tsx";
import CreateQuizPopup from "./CreateQuizPopup.tsx";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router";
import {authFetch} from "../api.ts";
import {useAuth} from "../hooks/useAuth.ts";
import {socket} from "../socket.js";

export default function MainHomeBox(props) {
    const [quizzes, setQuizzes] = useState([]);
    const {email} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!email) return;
        authFetch<{ id: string; name: string }[]>(`/users/${email}/quizzes`)
            .then((data) => setQuizzes(data))
            .catch((err) => console.error('Failed to load quizzes', err))
    }, [email])

    useEffect(() => {
        const onSuccess = (sessionCode) => {
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