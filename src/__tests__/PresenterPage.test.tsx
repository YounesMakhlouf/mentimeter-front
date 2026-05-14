import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter, Route, Routes} from 'react-router';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {QuestionPayload} from '../socket';
import PresenterPage from '../pages/PresenterPage';

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

const buildQuestion = (
    n: number,
    text: string,
    options: string[],
    correctIdx: number,
    totalQuestions = 3,
): QuestionPayload => ({
    quizCode: '748215',
    questionNumber: n,
    totalQuestions,
    question: {
        question: text,
        options: options.map((label, i) => ({label, isCorrect: i === correctIdx})),
    },
});

const renderAt = (state: unknown) =>
    render(
        <MemoryRouter initialEntries={[{pathname: '/present', state}]}>
            <Routes>
                <Route path="/present" element={<PresenterPage/>}/>
                <Route path="/home" element={<div>home route</div>}/>
                <Route path="/leaderboard" element={<div>leaderboard route</div>}/>
            </Routes>
        </MemoryRouter>,
    );

describe('PresenterPage', () => {
    beforeEach(() => {
        for (const key of Object.keys(handlers)) delete handlers[key];
        vi.mocked(socket.emit).mockClear();
        sessionStorage.clear();
        vi.useFakeTimers({shouldAdvanceTime: true});
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('redirects to /home when no sessionCode is in state or sessionStorage', () => {
        renderAt({});
        expect(screen.getByText('home route')).toBeInTheDocument();
    });

    it('persists sessionCode to sessionStorage on mount', () => {
        renderAt({sessionCode: '748215'});
        expect(sessionStorage.getItem('present:sessionCode')).toBe('748215');
    });

    it('emits sendQuestion(0) on mount, after subscribing to the question listener', () => {
        renderAt({sessionCode: '748215'});

        expect(socket.emit).toHaveBeenCalledWith('sendQuestion', {
            quizCode: '748215',
            questionNumber: 0,
        });
        // The kick-off emit must happen *after* the question listener is
        // registered — otherwise the server's response would race the mount
        // and the first question would be dropped.
        expect(handlers.question?.length ?? 0).toBeGreaterThan(0);
    });

    it('shows the waiting state until the first question event arrives', () => {
        renderAt({sessionCode: '748215'});
        expect(screen.getByText(/waiting for the first question/i)).toBeInTheDocument();
    });

    it('renders the "Question NN / MM" label from the payload', () => {
        renderAt({sessionCode: '748215'});

        trigger('question', buildQuestion(1, 'Q', ['a', 'b', 'c', 'd'], 0, 5));

        // questionNumber is zero-indexed; the label shows 1-based.
        expect(screen.getByText(/Question 02 \/ 05/i)).toBeInTheDocument();
    });

    it('renders the question and option labels when a question event fires', () => {
        renderAt({sessionCode: '748215'});

        trigger('question', buildQuestion(0, 'What is 2+2?', ['3', '4', '5', '6'], 1));

        expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
        for (const label of ['3', '4', '5', '6']) {
            expect(screen.getByText(label)).toBeInTheDocument();
        }
    });

    it('tallies answers from answerReceived events per option', () => {
        renderAt({sessionCode: '748215', playerCount: 5});
        trigger('question', buildQuestion(0, 'Q', ['alpha', 'beta', 'gamma', 'delta'], 1));

        trigger('answerReceived', {questionNumber: 0, answer: 'beta', playerPseudo: 'p1'});
        trigger('answerReceived', {questionNumber: 0, answer: 'beta', playerPseudo: 'p2'});
        trigger('answerReceived', {questionNumber: 0, answer: 'gamma', playerPseudo: 'p3'});

        expect(screen.getByText(/3 of 5 answered/i)).toBeInTheDocument();
    });

    it('resets the count and timer when a new question arrives', () => {
        renderAt({sessionCode: '748215', playerCount: 3});

        trigger('question', buildQuestion(0, 'First', ['a', 'b', 'c', 'd'], 0));
        trigger('answerReceived', {questionNumber: 0, answer: 'a', playerPseudo: 'p1'});
        expect(screen.getByText(/1 of 3 answered/i)).toBeInTheDocument();

        trigger('question', buildQuestion(1, 'Second', ['w', 'x', 'y', 'z'], 0));

        expect(screen.getByText('Second')).toBeInTheDocument();
        expect(screen.getByText(/0 of 3 answered/i)).toBeInTheDocument();
    });

    it('emits sendQuestion with the next number when Skip is clicked', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        renderAt({sessionCode: '748215'});
        trigger('question', buildQuestion(0, 'Q', ['a', 'b', 'c', 'd'], 0));

        await user.click(screen.getByRole('button', {name: /^skip$/i}));

        expect(socket.emit).toHaveBeenCalledWith('sendQuestion', {
            quizCode: '748215',
            questionNumber: 1,
        });
    });

    it('switches the action label to Next when the timer reaches 0', () => {
        renderAt({sessionCode: '748215'});
        trigger('question', buildQuestion(0, 'Q', ['a', 'b', 'c', 'd'], 0));
        expect(screen.getByRole('button', {name: /^skip$/i})).toBeInTheDocument();

        act(() => {
            vi.advanceTimersByTime(10_000);
        });

        expect(screen.getByRole('button', {name: /^next →$/i})).toBeInTheDocument();
    });

    it('bumps the player count when playerJoined fires mid-quiz', () => {
        renderAt({sessionCode: '748215', playerCount: 2});
        expect(screen.getByText(/Live · 2 players/i)).toBeInTheDocument();

        trigger('playerJoined', {playerName: 'Late Arrival', avatar: '🦊'});

        expect(screen.getByText(/Live · 3 players/i)).toBeInTheDocument();
    });

    it('navigates to /leaderboard when endQuiz fires', () => {
        renderAt({sessionCode: '748215'});
        trigger('endQuiz', [{playerName: 'A', avatar: '🦊', score: 10}]);
        expect(screen.getByText('leaderboard route')).toBeInTheDocument();
    });

    it('navigates to /home when End is clicked', async () => {
        const user = userEvent.setup({advanceTimers: vi.advanceTimersByTime});
        renderAt({sessionCode: '748215'});
        await user.click(screen.getByRole('button', {name: /^end$/i}));
        expect(screen.getByText('home route')).toBeInTheDocument();
    });

    it('cleans up question / answerReceived / playerJoined / endQuiz listeners on unmount', () => {
        const {unmount} = renderAt({sessionCode: '748215'});

        for (const evt of ['question', 'answerReceived', 'playerJoined', 'endQuiz']) {
            expect(handlers[evt]).toHaveLength(1);
        }

        unmount();

        for (const evt of ['question', 'answerReceived', 'playerJoined', 'endQuiz']) {
            expect(handlers[evt]).toHaveLength(0);
        }
    });
});
