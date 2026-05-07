import QuizBox from "./QuizBox.tsx";
import CreateQuizPopup from "./CreateQuizPopup.tsx";
import {useEffect, useState} from "react";
import {authFetch} from "../api.ts";

export default function MainHomeBox(props) {
    const [quizzes, setQuizzes] = useState([]);

    const userinfo = JSON.parse(localStorage.getItem('loginInfo'))
    const email = userinfo != null ? userinfo['email'] : "stranger@gmail.com"

    useEffect(() => {
        authFetch<{ id: string; name: string }[]>(`/users/${email}/quizzes`)
            .then((data) => setQuizzes(data))
            .catch((err) => console.error('Failed to load quizzes', err))
    }, [email])

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