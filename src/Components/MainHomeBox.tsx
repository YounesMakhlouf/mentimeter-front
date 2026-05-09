import {useEffect, useMemo, useState} from "react";
import {useLoaderData, useNavigate} from "react-router";
import styled from "styled-components";
import {socket} from "../socket.ts";
import type {Quiz} from "../loaders.ts";
import QuizBox from "./QuizBox.tsx";
import CreateQuizPopup from "./CreateQuizPopup.tsx";
import {Chip} from "../design/styled.ts";
import {formatTopic} from "../topics.ts";

const ALL_FILTER = 'All';

type QuizWithTopic = Quiz & {topic?: string};

const Outer = styled.div`
    padding: 1.5rem;
    max-width: 80rem;

    @media (min-width: 50rem) {
        padding: 2rem 3rem;
    }
`;

const Greeting = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1.5rem;
    margin-bottom: 1.75rem;
    flex-wrap: wrap;
`;

const DateLabel = styled.div`
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--ink-mute);
`;

const Hi = styled.h1`
    font-size: 2.5rem;
    margin-top: 0.375rem;

    @media (min-width: 37.5rem) {
        font-size: 3.5rem;
    }
`;

const Wave = styled.span`
    display: inline-block;
    animation: wiggle 1.6s ease-in-out infinite;
`;

const Subtitle = styled.p`
    color: var(--ink-mute);
    font-size: 1.125rem;
    margin-top: 0.375rem;
`;

const FilterRow = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
`;

const FilterChip = styled(Chip)<{$active?: boolean}>`
    cursor: pointer;
    background: ${({$active}) => $active ? 'var(--ink)' : 'var(--card)'};
    color: ${({$active}) => $active ? 'var(--paper)' : 'var(--ink)'};
    user-select: none;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(16.25rem, 1fr));
    gap: 1.125rem;
`;

const NewQuizCard = styled.button`
    border: 2.5px dashed var(--ink);
    background: transparent;
    cursor: pointer;
    box-shadow: none;
    min-height: 17.5rem;
    border-radius: var(--r-lg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;
    color: var(--ink);
    font-family: var(--body);
    padding: 1.5rem;

    &:hover { background: rgba(0, 0, 0, .03); }
`;

const NewQuizPlus = styled.div`
    font-size: 3rem;
    line-height: 1;
`;

const NewQuizTitle = styled.div`
    font-family: var(--display);
    font-size: 1.25rem;
    font-weight: 800;
`;

const NewQuizHint = styled.div`
    color: var(--ink-mute);
    font-size: 0.8125rem;
`;

const TODAY_LABEL = (() => {
    try {
        return new Date().toLocaleDateString(undefined, {weekday: 'long', month: 'short', day: 'numeric'});
    } catch {
        return '';
    }
})();

interface MainHomeBoxProps {
    name: string;
}

export default function MainHomeBox({name}: MainHomeBoxProps) {
    const {quizzes} = useLoaderData() as {quizzes: QuizWithTopic[]};
    const navigate = useNavigate();
    const [filter, setFilter] = useState<string>(ALL_FILTER);

    useEffect(() => {
        const onSuccess = (sessionCode: string) => {
            navigate('/startquiz', {state: {sessionCode}});
        };
        socket.on('QuizCreationSuccess', onSuccess);
        return () => {
            socket.off('QuizCreationSuccess', onSuccess);
        };
    }, [navigate]);

    const availableTopics = useMemo(() => {
        const set = new Set<string>();
        for (const q of quizzes) {
            if (q.topic) set.add(q.topic.toLowerCase());
        }
        return [...set].sort();
    }, [quizzes]);

    const filterChips = useMemo(() => [ALL_FILTER, ...availableTopics], [availableTopics]);

    const visible = useMemo(() => {
        if (filter === ALL_FILTER) return quizzes;
        return quizzes.filter((q) => q.topic?.toLowerCase() === filter);
    }, [quizzes, filter]);

    const firstName = name.split(' ')[0];

    return (
        <Outer>
            <Greeting>
                <div>
                    <DateLabel>{TODAY_LABEL}</DateLabel>
                    <Hi>Hey {firstName} <Wave>👋</Wave></Hi>
                    <Subtitle>Your classes are warmed up. Pick a quiz or build a new one.</Subtitle>
                </div>
                <CreateQuizPopup/>
            </Greeting>

            {filterChips.length > 1 && (
                <FilterRow>
                    {filterChips.map((t) => (
                        <FilterChip
                            key={t}
                            as="button"
                            $active={filter === t}
                            onClick={() => setFilter(t)}
                            type="button"
                        >{t === ALL_FILTER ? t : formatTopic(t)}</FilterChip>
                    ))}
                </FilterRow>
            )}

            <Grid>
                {visible.map((quiz) => (
                    <QuizBox key={quiz.id} quiz={quiz}/>
                ))}
                <CreateQuizPopup
                    trigger={(open) => (
                        <NewQuizCard type="button" onClick={open}>
                            <NewQuizPlus>＋</NewQuizPlus>
                            <NewQuizTitle>New quiz</NewQuizTitle>
                            <NewQuizHint>Start from scratch</NewQuizHint>
                        </NewQuizCard>
                    )}
                />
            </Grid>

            {quizzes.length === 0 && (
                <div style={{textAlign: 'center', padding: '3.75rem 0', color: 'var(--ink-mute)'}}>
                    No quizzes yet. Hit “New quiz” to create your first one.
                </div>
            )}
        </Outer>
    );
}
