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
    padding: 24px;
    max-width: 1280px;

    @media (min-width: 800px) {
        padding: 32px 48px;
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
    font-size: 40px;
    margin-top: 6px;

    @media (min-width: 600px) {
        font-size: 56px;
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

const NewQuizCard = styled.button`
    border: 2.5px dashed var(--ink);
    background: transparent;
    cursor: pointer;
    box-shadow: none;
    min-height: 280px;
    border-radius: var(--r-lg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: var(--ink);
    font-family: var(--body);
    padding: 24px;

    &:hover { background: rgba(0, 0, 0, .03); }
`;

const NewQuizPlus = styled.div`
    font-size: 48px;
    line-height: 1;
`;

const NewQuizTitle = styled.div`
    font-family: var(--display);
    font-size: 20px;
    font-weight: 800;
`;

const NewQuizHint = styled.div`
    color: var(--ink-mute);
    font-size: 13px;
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
                <div style={{textAlign: 'center', padding: '60px 0', color: 'var(--ink-mute)'}}>
                    No quizzes yet. Hit “New quiz” to create your first one.
                </div>
            )}
        </Outer>
    );
}
