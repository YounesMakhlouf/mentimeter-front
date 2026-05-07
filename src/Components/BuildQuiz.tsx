import {useState} from 'react';
import {useNavigate} from "react-router";
import {useLocation, Navigate} from 'react-router-dom';
import {FaTrash} from "react-icons/fa";
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

const styles = `

/* Topic selection dropdown */
select.topic-dropdown {
  width: 100%;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.error-message {
  color: #f44336;
}

/* Question input and options container */
.question-container {
  display: flex;
  align-items: center;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 0.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Question input field */
.question-input {
  width: 80%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.option-container {
  display: flex;
  align-items: center;
}

/* Option input field */
.option-input {
  width: 80%;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
  margin-right: 10px;
}

/* Validity checkbox */
.validity-checkbox {
  margin-right: 5px;
}

/* Option button (remove) */
.option-remove-btn {
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

/* Add question/option buttons */
.add-btn {
  background-color: #0095ff;
  color: #fff;
  padding: 5px 10px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

/* Submit button */
.submit-btn {
  background-color: #4caf50;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

/* Media query for smaller screens */
@media (max-width: 768px) {
  .quiz-form {
    width: 100%;
    padding: 10px;
  }
  
  .question-input,
  .option-input {
    width: 100%;
  }
}
`;

function BuildQuiz() {
    const location = useLocation();
    const navigate = useNavigate()
    const [topic, setTopic] = useState('');
    const [questions, setQuestions] = useState([{text: '', options: [''], validity: [false], correctAnswer: ''}]);
    const [errorMessage, setErrorMessage] = useState('');

    if (!location.state?.quizName) {
        return <Navigate to="/home" replace />;
    }
    const quizName: string = location.state.quizName;

    const addQuestion = () => {
        setQuestions([...questions, {text: '', options: [''], validity: [false], correctAnswer: ''}]);
    };

    const handleQuestionChange = (index, event) => {
        const newQuestions = [...questions];
        newQuestions[index].text = event.target.value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (questionIndex, optionIndex, event) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].options[optionIndex] = event.target.value;
        setQuestions(newQuestions);
    };

    const handleValidityChange = (questionIndex, optionIndex) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].validity[optionIndex] = !newQuestions[questionIndex].validity[optionIndex];
        if (newQuestions[questionIndex].validity[optionIndex]) {
            newQuestions[questionIndex].validity = newQuestions[questionIndex].validity.map((value, index) => {
                if (index !== optionIndex) {
                    return false;
                }
                return value;
            });
        }

        setQuestions(newQuestions);
    };

    const addOption = (questionIndex) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].options.push('');
        newQuestions[questionIndex].validity.push(false);
        setQuestions(newQuestions);
    };

    const removeOption = (questionIndex, optionIndex) => {
        const newQuestions = [...questions];
        newQuestions[questionIndex].options.splice(optionIndex, 1);
        newQuestions[questionIndex].validity.splice(optionIndex, 1);
        setQuestions(newQuestions);
    };

    const removeQuestion = (index) => {
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        setQuestions(newQuestions);
    };

    const handleTopicChange = (event) => {
        setTopic(event.target.value);
    };


    const handleSubmit = () => {
        // Validate that each question has at least one correct answer
        const isValid = questions.every(question => question.validity.includes(true));

        if (!isValid) {
            setErrorMessage('Each question must have at least one correct answer.');
            return;
        }

        const quizData = {
            name: quizName, code: null, topic: topic, questions: questions.map(question => ({
                question: question.text,
                options: question.options.map((option, index) => ({
                    label: option, isCorrect: question.validity[index]
                })),
                correctAnswer: question.options[question.validity.indexOf(true)],
            }))
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
        <select className='topic-dropdown' value={topic} onChange={handleTopicChange}>
            <option value="">Select Topic</option>
            {Object.entries(Topics).map(([key, value]) => (<option key={key} value={value}>
                {key}
            </option>))}
        </select>
        {errorMessage && <p className='error-message'>{errorMessage}</p>}
        {questions.map((question, index) => (<section key={index} className='flow wrapper question-container'>
            <label>Question {index + 1}</label>
            <input
                type="text"
                className="question-input"
                value={question.text}
                onChange={(e) => handleQuestionChange(index, e)}
                placeholder="Enter question"
            />
            {question.options.map((option, optionIndex) => (<div key={optionIndex} className='option-container'>
                <input
                    type="text"
                    className="option-input"
                    value={option}
                    onChange={(e) => handleOptionChange(index, optionIndex, e)}
                    placeholder="Enter option"
                />
                <input
                    type="checkbox"
                    className="validity-checkbox"
                    checked={question.validity[optionIndex]}
                    onChange={() => handleValidityChange(index, optionIndex)}
                />
                <label>Correct </label>
                <button className='option-remove-btn'
                        onClick={() => removeOption(index, optionIndex)}><FaTrash/>
                </button>
            </div>))}
            <button className='add-btn' onClick={() => addOption(index)}>Add Option</button>
            <button onClick={() => removeQuestion(index)}><FaTrash/></button>
        </section>))}
        <button className='add-btn' onClick={addQuestion}>Add Question</button>
        <br/>
        <button className='submit-btn' onClick={handleSubmit}>Submit Quiz</button>
        <style>{styles}</style>
    </div>);
}

export default BuildQuiz;
