import styled from "styled-components";
import {socket} from '../socket.ts';
import type {Quiz} from '../loaders.ts';
import {Card, Chip, PrimaryButton} from "../design/styled.ts";
import {OPT_META} from "../design/tokens.ts";
import {formatTopic} from "../topics.ts";

const Article = styled(Card)`
    overflow: hidden;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    padding: 0;
`;

const CoverArea = styled.div<{$color: string}>`
    height: 130px;
    background: ${({$color}) => $color};
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 64px;
`;

const TopicChip = styled(Chip)`
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 11px;
    padding: 3px 10px;
`;

const Body = styled.div`
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
`;

const Title = styled.h3`
    font-size: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
`;

const Meta = styled.div`
    color: var(--ink-mute);
    font-size: 13px;
    font-weight: 500;
`;

const Actions = styled.div`
    display: flex;
    gap: 8px;
    margin-top: 6px;
`;

const ActionBtn = styled.button`
    flex: 1;
    border: 2.5px solid var(--ink);
    background: var(--card);
    color: var(--ink);
    border-radius: var(--r-md);
    padding: 10px 14px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: var(--shadow-sm);
    font-family: var(--body);
    &:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); }
`;

const StartBtn = styled(PrimaryButton)`
    flex: 1;
    padding: 10px 14px;
    font-size: 14px;
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

    const handleStart = () => {
        socket.emit('createQuizSession', {quizId: quiz.id});
    };

    return (
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
                    <ActionBtn type="button" disabled>Edit</ActionBtn>
                </Actions>
            </Body>
        </Article>
    );
}
