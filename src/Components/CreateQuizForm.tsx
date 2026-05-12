import {ChangeEvent, SyntheticEvent, useState} from "react";
import styled from "styled-components";
import {randomQuizName} from '../utils/quizname-generator.ts';
import {useNavigate} from "react-router";
import {Button, Input, Stack} from "../design";

const Heading = styled.h3`
    margin: 0;
`;

const Subtle = styled.p`
    color: var(--ink-mute);
    margin: 0;
    font-size: var(--step--1);
`;

export default function CreateQuizForm() {
    const [name, setName] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        navigate('/build', {state: {quizName: name || randomQuizName}});
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    return (
        <>
            <Heading>Let's name your new quiz</Heading>
            <Subtle>You can change it later from the editor.</Subtle>
            <Stack as="form" onSubmit={handleSubmit}>
                <Input
                    type="text"
                    name="name"
                    value={name}
                    onChange={handleInputChange}
                    placeholder={randomQuizName}
                    autoFocus
                />
                <Button type="submit" $variant="primary" $size="lg">
                    Let's go →
                </Button>
            </Stack>
        </>
    );
}
