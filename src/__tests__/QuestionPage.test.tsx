import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter, Route, Routes} from 'react-router';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {QuestionPayload} from '../socket';
import QuestionPage from '../pages/QuestionPage';

type Handler = (...args: unknown[]) => void;

const handlers: Record<string, Handler[]> = {};

vi.mock('../socket.ts', () => ({
    socket: {
        on: vi.fn((event: string, handler: Handler) => {
            (handlers[event] ||= []).push(handler);
        }),
        off: vi.fn((event: string, handler: Handler) => {
            handlers[event] = (handlers[event] || []).filter((h) => h !== handler);
        }),
        emit: vi.fn(),
    },
}));

import {socket} from '../socket';

const trigger = (event: string, ...args: unknown[]) => {
    act(() => {
        (handlers[event] || []).forEach((h) => h(...args));
    });
};

const buildPayload = (
    questionNumber: number,
    questionText: string,
    options: string[],
    correctIdx: number,
): QuestionPayload => ({
    questionNumber,
    quizCode: '123456',
    totalQuestions: 1,
    question: {
        question: questionText,
        options: options.map((label, i) => ({label, isCorrect: i === correctIdx})),
    },
});

const renderAt = (initialState: unknown) =>
    render(
        <MemoryRouter initialEntries={[{pathname: '/qspage', state: initialState}]}>
            <Routes>
                <Route path="/qspage" element={<QuestionPage/>}/>
                <Route path="/leaderboard" element={<div>leaderboard route</div>}/>
                <Route path="/" element={<div>home route</div>}/>
            </Routes>
        </MemoryRouter>,
    );

describe('QuestionPage', () => {
    beforeEach(() => {
        for (const key of Object.keys(handlers)) delete handlers[key];
        vi.mocked(socket.emit).mockClear();
        sessionStorage.clear();
        localStorage.clear();
        sessionStorage.setItem('qspage:playerName', 'Alice');
    });

    it('renders the initial question seeded from route state (no extra socket round-trip needed)', () => {
        const payload = buildPayload(0, 'Capital of France?', ['Paris', 'Lyon', 'Marseille', 'Nice'], 0);
        renderAt({payload});

        expect(screen.getByText('Capital of France?')).toBeInTheDocument();
        expect(screen.getByText('Paris')).toBeInTheDocument();
        expect(screen.getByText('Lyon')).toBeInTheDocument();
        // Sanity: the "Waiting for the host…" fallback should NOT be shown.
        expect(screen.queryByText(/Waiting for the host/i)).not.toBeInTheDocument();
    });

    it('does not emit sendQuestion on mount (that is the host-side command)', () => {
        const payload = buildPayload(0, 'Q?', ['a', 'b', 'c', 'd'], 0);
        renderAt({payload});

        const sendQuestionCalls = vi.mocked(socket.emit).mock.calls.filter(([event]) => event === 'sendQuestion');
        expect(sendQuestionCalls).toHaveLength(0);
    });

    it('emits getAnswer with the picked label and player pseudo when an option is clicked', async () => {
        const user = userEvent.setup();
        const payload = buildPayload(0, 'Pick one', ['alpha', 'beta', 'gamma', 'delta'], 2);
        renderAt({payload});

        await user.click(screen.getByText('beta'));

        expect(socket.emit).toHaveBeenCalledWith('getAnswer', {
            quizCode: '123456',
            answer: 'beta',
            questionNumber: 0,
            playerPseudo: 'Alice',
        });
    });

    it('switches to the next question when a new question event arrives', () => {
        const first = buildPayload(0, 'First?', ['a', 'b', 'c', 'd'], 0);
        renderAt({payload: first});

        const second = buildPayload(1, 'Second?', ['w', 'x', 'y', 'z'], 1);
        trigger('question', second);

        expect(screen.getByText('Second?')).toBeInTheDocument();
        expect(screen.getByText('w')).toBeInTheDocument();
        // The first question's options should no longer be on screen.
        expect(screen.queryByText('First?')).not.toBeInTheDocument();
    });

    it('navigates to /leaderboard when endQuiz fires', () => {
        const payload = buildPayload(0, 'Q?', ['a', 'b', 'c', 'd'], 0);
        renderAt({payload});

        trigger('endQuiz', [{playerName: 'Alice', avatar: '🦊', score: 100}]);

        expect(screen.getByText('leaderboard route')).toBeInTheDocument();
    });

    it('navigates home when sessionEnded fires (host disconnected mid-game)', () => {
        const payload = buildPayload(0, 'Q?', ['a', 'b', 'c', 'd'], 0);
        renderAt({payload});

        trigger('sessionEnded', {reason: 'host disconnected'});

        expect(screen.getByText('home route')).toBeInTheDocument();
    });

    it('redirects home when there is no quizCode in state or sessionStorage', () => {
        renderAt({});
        expect(screen.getByText('home route')).toBeInTheDocument();
    });

    it('persists the quizCode to sessionStorage on mount', () => {
        const payload = buildPayload(0, 'Q?', ['a', 'b', 'c', 'd'], 0);
        renderAt({payload});
        expect(sessionStorage.getItem('qspage:quizCode')).toBe('123456');
    });

    it('cleans up question / endQuiz / sessionEnded listeners on unmount', () => {
        const payload = buildPayload(0, 'Q?', ['a', 'b', 'c', 'd'], 0);
        const {unmount} = renderAt({payload});

        for (const evt of ['question', 'endQuiz', 'sessionEnded']) {
            expect(handlers[evt]).toHaveLength(1);
        }

        unmount();

        for (const evt of ['question', 'endQuiz', 'sessionEnded']) {
            expect(handlers[evt]).toHaveLength(0);
        }
    });
});
