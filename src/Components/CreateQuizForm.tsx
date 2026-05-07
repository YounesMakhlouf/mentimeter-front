import {ChangeEvent, useState} from "react";
import {randomQuizName} from '../utils/quizname-generator.ts';
import {useNavigate} from "react-router";
import styled from "styled-components";

const Form = styled.form`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
`;

const NameInput = styled.input`
    width: 100%;
    height: 3em;
    border-radius: 50px;
    border: none;
    padding-left: 1em;
`;

const SubmitButton = styled.button`
    width: 10em;
    height: 4em;
    border-radius: 50px;
    margin-top: 1em;
    background-color: rgba(225, 175, 209, 0.94);
`;

export default function CreateQuizForm() {
    const [formData, setFormData] = useState({name: ''});
    const navigate = useNavigate();

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;
        setFormData({...formData, [name]: value});
    };

    return (
        <>
            <h3>Let's give your new quiz a name </h3>
            <Form onSubmit={(event) => {
                event.preventDefault();
                navigate('/build', {state: {quizName: formData.name}});
            }}>
                <div>
                    <NameInput
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder={randomQuizName}
                    />
                </div>
                <SubmitButton>Let's Go !</SubmitButton>
            </Form>
        </>
    );
}
