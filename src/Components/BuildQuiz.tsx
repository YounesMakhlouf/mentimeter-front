import {ChangeEvent, useState} from 'react';
import {Navigate, useLocation, useNavigate} from "react-router";
import {FaTrash} from "react-icons/fa";
import styled from "styled-components";
import {authFetch} from "../api.ts";

const Topics = {
    ANIMALS: 'animals',
    SCIENCE: 'science',
    PHYSICS: 'physics',
    BIOLOGY: 'biology',
    CHEMISTRY: 'chemistry',
    MATH: 'math',
    GEOGRAPHY: 'geography',
    HISTORY: 'history',
    SPORTS: 'sports',
    MOVIES: 'movies',
    MUSIC: 'music',
    LITERATURE: 'literature',
    ART: 'art',
    POLITICS: 'politics',
    PROGRAMMING: 'programming',
    SPACE: 'space',
} as const;

const TopicSelect = styled.select`
    width: 100%;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 3px;
`;

const ErrorMessage = styled.p`
    color: #f44336;
`;

const QuestionCard = styled.section`
    display: flex;
    align-items: center;
    flex-direction: column;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 0.5rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const QuestionInput = styled.input`
    width: 80%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 3px;
    @media (max-width: 768px) { width: 100%; }
`;

const OptionRow = styled.div`
    display: flex;
    align-items: center;
`;

const OptionInput = styled.input`
    width: 80%;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 3px;
    margin-right: 10px;
    @media (max-width: 768px) { width: 100%; }
`;

const RemoveButton = styled.button`
    border: none;
    border-radius: 3px;
    cursor: pointer;
`;

const AddButton = styled.button`
    background-color: #0095ff;
    color: #fff;
    padding: 5px 10px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
`;

const SubmitButton = styled.button`
    background-color: #4caf50;
    color: #fff;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
`;

interface QuestionDraft {
    text: string;
    options: string[];
    correctIndex: number | null;
}

const blankQuestion = (): QuestionDraft => ({text: '', options: [''], correctIndex: null});

function BuildQuiz() {
    const location = useLocation();
    const navigate = useNavigate()
    const [topic, setTopic] = useState('');
    const [questions, setQuestions] = useState<QuestionDraft[]>([blankQuestion()]);
    const [errorMessage, setErrorMessage] = useState('');

    if (!location.state?.quizName) {
        return <Navigate to="/home" replace />;
    }
    const quizName: string = location.state.quizName;

    const updateQuestion = (index: number, patch: Partial<QuestionDraft>) => {
        setQuestions((prev) => prev.map((q, i) => i === index ? {...q, ...patch} : q));
    };

    const addQuestion = () => setQuestions((prev) => [...prev, blankQuestion()]);

    const removeQuestion = (index: number) => {
        setQuestions((prev) => prev.filter((_, i) => i !== index));
    };

    const handleQuestionChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
        updateQuestion(index, {text: event.target.value});
    };

    const handleOptionChange = (questionIndex: number, optionIndex: number, event: ChangeEvent<HTMLInputElement>) => {
        const q = questions[questionIndex];
        const options = q.options.map((o, i) => i === optionIndex ? event.target.value : o);
        updateQuestion(questionIndex, {options});
    };

    const handleCorrectChange = (questionIndex: number, optionIndex: number) => {
        updateQuestion(questionIndex, {correctIndex: optionIndex});
    };

    const addOption = (questionIndex: number) => {
        const q = questions[questionIndex];
        updateQuestion(questionIndex, {options: [...q.options, '']});
    };

    const removeOption = (questionIndex: number, optionIndex: number) => {
        const q = questions[questionIndex];
        const options = q.options.filter((_, i) => i !== optionIndex);
        let correctIndex = q.correctIndex;
        if (correctIndex === optionIndex) correctIndex = null;
        else if (correctIndex !== null && correctIndex > optionIndex) correctIndex -= 1;
        updateQuestion(questionIndex, {options, correctIndex});
    };

    const handleTopicChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setTopic(event.target.value);
    };

    const handleSubmit = () => {
        const allHaveCorrect = questions.every((q) => q.correctIndex !== null);
        if (!allHaveCorrect) {
            setErrorMessage('Each question must have a correct answer selected.');
            return;
        }

        const quizData = {
            name: quizName, code: null, topic, questions: questions.map((q) => ({
                question: q.text,
                options: q.options.map((option, index) => ({
                    label: option, isCorrect: index === q.correctIndex,
                })),
                correctAnswer: q.options[q.correctIndex!],
            })),
        };

        authFetch('/quizzes', {
            method: 'POST',
            body: JSON.stringify(quizData),
        })
            .then(() => navigate('/home'))
            .catch((error) => {
                console.error('Error:', error);
                setErrorMessage('Failed to save quiz. Please try again.');
            });
    };

    return (<div className='flow wrapper'>
        <h1>Create Your Impossible Quiz</h1>
        <h2>Quiz Name: {quizName}</h2>
        <TopicSelect value={topic} onChange={handleTopicChange}>
            <option value="">Select Topic</option>
            {Object.entries(Topics).map(([key, value]) => (
                <option key={key} value={value}>{key}</option>
            ))}
        </TopicSelect>
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        {questions.map((question, index) => (
            <QuestionCard key={index} className='flow wrapper'>
                <label>Question {index + 1}</label>
                <QuestionInput
                    type="text"
                    value={question.text}
                    onChange={(e) => handleQuestionChange(index, e)}
                    placeholder="Enter question"
                />
                {question.options.map((option, optionIndex) => (
                    <OptionRow key={optionIndex}>
                        <OptionInput
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, optionIndex, e)}
                            placeholder="Enter option"
                        />
                        <input
                            type="radio"
                            name={`correct-${index}`}
                            checked={question.correctIndex === optionIndex}
                            onChange={() => handleCorrectChange(index, optionIndex)}
                            style={{marginRight: '5px'}}
                        />
                        <label>Correct </label>
                        <RemoveButton onClick={() => removeOption(index, optionIndex)}>
                            <FaTrash/>
                        </RemoveButton>
                    </OptionRow>
                ))}
                <AddButton onClick={() => addOption(index)}>Add Option</AddButton>
                <button onClick={() => removeQuestion(index)}><FaTrash/></button>
            </QuestionCard>
        ))}
        <AddButton onClick={addQuestion}>Add Question</AddButton>
        <br/>
        <SubmitButton onClick={handleSubmit}>Submit Quiz</SubmitButton>
    </div>);
}

export default BuildQuiz;
