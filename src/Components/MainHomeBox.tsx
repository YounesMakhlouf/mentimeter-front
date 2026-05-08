import {useEffect, useMemo, useState} from "react";
import {useLoaderData, useNavigate} from "react-router";
import styled from "styled-components";
import {socket} from "../socket.ts";
import type {Quiz} from "../loaders.ts";
import QuizBox from "./QuizBox.tsx";
import CreateQuizPopup from "./CreateQuizPopup.tsx";
import {Chip} from "../design/styled.ts";

const Outer = styled.div`
    padding: 32px 48px;
    max-width: 1280px;

    @media (max-width: 800px) {
        padding: 24px;
    }
`;

const Greeting = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 28px;
    flex-wrap: wrap;
`;

const DateLabel = styled.div`
    font-weight: 600;
    font-size: 14px;
    color: var(--ink-mute);
`;

const Hi = styled.h1`
    font-size: 56px;
    margin-top: 6px;

    @media (max-width: 600px) {
        font-size: 40px;
    }
`;

const Wave = styled.span`
    display: inline-block;
    animation: wiggle 1.6s ease-in-out infinite;
`;

const Subtitle = styled.p`
    color: var(--ink-mute);
    font-size: 18px;
    margin-top: 6px;
`;

const FilterRow = styled.div`
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
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
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 18px;
`;

const TODAY_LABEL = (() => {
    try {
        return new Date().toLocaleDateString(undefined, {weekday: 'long', month: 'short', day: 'numeric'});
    } catch {
        return '';
    }
})();

const TOPICS = ['All', 'Math', 'Science', 'Geography', 'History', 'Literature', 'Space'];

interface MainHomeBoxProps {
    name: string;
}

export default function MainHomeBox({name}: MainHomeBoxProps) {
    const {quizzes} = useLoaderData() as {quizzes: Quiz[]};
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const onSuccess = (sessionCode: string) => {
            navigate('/startquiz', {state: {sessionCode}});
        };
        socket.on('QuizCreationSuccess', onSuccess);
        return () => {
            socket.off('QuizCreationSuccess', onSuccess);
        };
    }, [navigate]);

    const visible = useMemo(() => {
        if (filter === 'All') return quizzes;
        const needle = filter.toLowerCase();
        return quizzes.filter((q) => (q as Quiz & {topic?: string}).topic?.toLowerCase() === needle);
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

            <FilterRow>
                {TOPICS.map((t) => (
                    <FilterChip
                        key={t}
                        as="button"
                        $active={filter === t}
                        onClick={() => setFilter(t)}
                        type="button"
                    >{t}</FilterChip>
                ))}
            </FilterRow>

            <Grid>
                {visible.map((quiz) => (
                    <QuizBox key={quiz.id} quiz={quiz}/>
                ))}
            </Grid>

            {quizzes.length === 0 && (
                <div style={{textAlign: 'center', padding: '60px 0', color: 'var(--ink-mute)'}}>
                    No quizzes yet. Hit “New quiz” to create your first one.
                </div>
            )}
        </Outer>
    );
}
