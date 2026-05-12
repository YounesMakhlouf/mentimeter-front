import {useState} from "react";
import styled from "styled-components";
import {FaTrash} from "react-icons/fa";
import {useRevalidator} from "react-router";
import {socket} from '../socket.ts';
import {authFetch} from '../api.ts';
import type {Quiz} from '../loaders.ts';
import {Button, Card, Chip, OPT_META} from "../design";
import {formatTopic} from "../topics.ts";
import Modal from "./Modal.tsx";
import EditQuizForm from "./EditQuizForm.tsx";

const Article = styled(Card)`
    overflow: hidden;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    padding: 0;
`;

const CoverArea = styled.div<{$color: string}>`
    height: 8.125rem;
    background: ${({$color}) => $color};
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--step-5);
`;

const TopicChip = styled(Chip)`
    position: absolute;
    top: 0.625rem;
    left: 0.625rem;
    font-size: var(--step--2);
    padding: 3px 0.625rem;
`;

const Body = styled.div`
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
`;

const Title = styled.h3`
    font-size: var(--step-0);
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
`;

const Meta = styled.div`
    color: var(--ink-mute);
    font-size: var(--step--2);
    font-weight: 500;
`;

const Actions = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-top: 0.375rem;
`;

const ActionBtn = styled.button`
    flex: 1;
    border: 2.5px solid var(--ink);
    background: var(--card);
    color: var(--ink);
    border-radius: var(--r-md);
    padding: 0.625rem 0.875rem;
    font-size: var(--step--1);
    font-weight: 700;
    cursor: pointer;
    box-shadow: var(--shadow-sm);
    font-family: var(--body);
    &:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); }
`;

const StartBtn = styled(Button).attrs({$variant: 'primary'})`
    flex: 1;
    padding: 0.625rem 0.875rem;
    font-size: var(--step--1);
`;

const TrashBtn = styled.button`
    flex: 0 0 auto;
    border: 2.5px solid var(--ink);
    background: var(--card);
    color: var(--ink);
    border-radius: var(--r-md);
    padding: 0.625rem 0.75rem;
    cursor: pointer;
    box-shadow: var(--shadow-sm);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    &:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); }
`;

const ConfirmStack = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const ConfirmActions = styled.div`
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
`;

const Subtle = styled.p`
    color: var(--ink-mute);
    margin: 0;
`;

const ErrorText = styled.div`
    color: #bc2525;
    font-weight: 600;
    font-size: var(--step--1);
`;

const TOPIC_DEFAULTS: Record<string, {color: string; emoji: string}> = {
    math: {color: 'var(--opt-c)', emoji: '➗'},
    science: {color: 'var(--opt-d)', emoji: '🔬'},
    physics: {color: 'var(--opt-d)', emoji: '⚛️'},
    biology: {color: 'var(--opt-d)', emoji: '🌱'},
    chemistry: {color: 'var(--opt-c)', emoji: '🧪'},
    geography: {color: 'var(--opt-c)', emoji: '🌍'},
    history: {color: 'var(--opt-a)', emoji: '🏛️'},
    sports: {color: 'var(--opt-a)', emoji: '⚽'},
    movies: {color: 'var(--opt-b)', emoji: '🎬'},
    music: {color: 'var(--opt-a)', emoji: '🎵'},
    literature: {color: 'var(--opt-a)', emoji: '📚'},
    art: {color: 'var(--opt-c)', emoji: '🎨'},
    politics: {color: 'var(--opt-b)', emoji: '🏛️'},
    programming: {color: 'var(--opt-b)', emoji: '💻'},
    space: {color: 'var(--opt-b)', emoji: '🪐'},
    animals: {color: 'var(--opt-d)', emoji: '🐾'},
};

const decorate = (topic?: string) => {
    if (topic && TOPIC_DEFAULTS[topic.toLowerCase()]) return TOPIC_DEFAULTS[topic.toLowerCase()];
    const idx = topic ? topic.charCodeAt(0) % OPT_META.length : 0;
    return {color: OPT_META[idx].colorVar, emoji: '🎲'};
};

interface Props {
    quiz: Quiz & {topic?: string};
}

export default function QuizBox({quiz}: Props) {
    const {color, emoji} = decorate(quiz.topic);
    const [editing, setEditing] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const revalidator = useRevalidator();

    const handleStart = () => {
        socket.emit('createQuizSession', {quizId: quiz.id});
    };

    const handleDelete = async () => {
        setDeleting(true);
        setDeleteError(null);
        try {
            await authFetch(`/quizzes/${quiz.id}`, {method: 'DELETE'});
            revalidator.revalidate();
            setConfirmingDelete(false);
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : 'Failed to delete.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <Article as="article">
                <CoverArea $color={color}>
                    {quiz.topic && (
                        <TopicChip as="span">{formatTopic(quiz.topic)}</TopicChip>
                    )}
                    {emoji}
                </CoverArea>
                <Body>
                    <Title>{quiz.name}</Title>
                    <Meta>Tap start to host a session</Meta>
                    <Actions>
                        <StartBtn type="button" onClick={handleStart}>▶ Start game</StartBtn>
                        <ActionBtn type="button" onClick={() => setEditing(true)}>Edit</ActionBtn>
                        <TrashBtn type="button" onClick={() => setConfirmingDelete(true)} aria-label="Delete quiz">
                            <FaTrash/>
                        </TrashBtn>
                    </Actions>
                </Body>
            </Article>

            <Modal open={editing} onClose={() => setEditing(false)}>
                <EditQuizForm
                    quizId={quiz.id}
                    initialName={quiz.name}
                    initialTopic={quiz.topic}
                    onSaved={() => setEditing(false)}
                />
            </Modal>

            <Modal open={confirmingDelete} onClose={() => !deleting && setConfirmingDelete(false)}>
                <ConfirmStack>
                    <h3>Delete this quiz?</h3>
                    <Subtle>
                        <b>{quiz.name}</b> will be removed from your dashboard. This can't be undone from the UI.
                    </Subtle>
                    {deleteError && <ErrorText>{deleteError}</ErrorText>}
                    <ConfirmActions>
                        <Button type="button" $variant="ghost" onClick={() => setConfirmingDelete(false)} disabled={deleting}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            $variant="ink"
                            onClick={handleDelete}
                            disabled={deleting}
                            style={{background: '#bc2525', borderColor: '#bc2525'}}
                        >
                            {deleting ? 'Deleting…' : 'Delete'}
                        </Button>
                    </ConfirmActions>
                </ConfirmStack>
            </Modal>
        </>
    );
}
