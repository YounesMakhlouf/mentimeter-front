import {ChangeEvent, FormEvent, useState} from 'react';
import styled from 'styled-components';
import {useRevalidator} from 'react-router';
import {authFetch} from '../api.ts';
import {Button, Input} from '../design';
import {TOPIC_KEYS, formatTopic} from '../topics.ts';

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const Field = styled.label`
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    font-weight: 600;
    font-size: var(--step--1);
`;

const Select = styled.select`
    appearance: none;
    border: 2.5px solid var(--line);
    background: var(--card);
    color: var(--ink);
    border-radius: var(--r-md);
    padding: 0.875rem 1.125rem;
    font-size: var(--step-0);
    font-family: var(--body);
    box-shadow: inset 0 -3px 0 rgba(0, 0, 0, .06);
`;

const ErrorMessage = styled.div`
    color: #bc2525;
    font-weight: 600;
    font-size: var(--step--1);
`;

interface Props {
    quizId: string;
    initialName: string;
    initialTopic?: string;
    onSaved: () => void;
}

export default function EditQuizForm({quizId, initialName, initialTopic, onSaved}: Props) {
    const [name, setName] = useState(initialName);
    const [topic, setTopic] = useState(initialTopic ?? '');
    const [error, setError] = useState<string | null>(null);
    const [pending, setPending] = useState(false);
    const revalidator = useRevalidator();

    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => setName(e.target.value);
    const handleTopicChange = (e: ChangeEvent<HTMLSelectElement>) => setTopic(e.target.value);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) {
            setError('Name is required.');
            return;
        }
        setPending(true);
        setError(null);
        try {
            await authFetch(`/quizzes/${quizId}`, {
                method: 'PATCH',
                body: JSON.stringify({name: trimmed, topic: topic || undefined}),
            });
            revalidator.revalidate();
            onSaved();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save.');
        } finally {
            setPending(false);
        }
    };

    return (
        <>
            <h3>Edit quiz</h3>
            <Form onSubmit={handleSubmit}>
                <Field>
                    <span>Name</span>
                    <Input
                        type="text"
                        value={name}
                        onChange={handleNameChange}
                        autoFocus
                        required
                    />
                </Field>
                <Field>
                    <span>Topic</span>
                    <Select value={topic} onChange={handleTopicChange}>
                        <option value="">No topic</option>
                        {TOPIC_KEYS.map((key) => (
                            <option key={key} value={key}>{formatTopic(key)}</option>
                        ))}
                    </Select>
                </Field>
                {error && <ErrorMessage>{error}</ErrorMessage>}
                <Button type="submit" $variant="primary" $size="lg" disabled={pending}>
                    {pending ? 'Saving…' : 'Save changes'}
                </Button>
            </Form>
        </>
    );
}
