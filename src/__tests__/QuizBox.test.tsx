import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {createMemoryRouter, RouterProvider} from 'react-router';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import QuizBox from '../Components/QuizBox';
import {futureJwt} from '../test/helpers';

vi.mock('../socket.ts', () => ({
    socket: {on: vi.fn(), off: vi.fn(), emit: vi.fn()},
}));

import {socket} from '../socket';

const fetchMock = vi.fn();
globalThis.fetch = fetchMock as unknown as typeof fetch;

const renderQuiz = (overrides: Partial<{id: string; name: string; topic: string}> = {}) => {
    const quiz = {id: '42', name: 'Capitals quiz', ...overrides};
    const router = createMemoryRouter([
        {
            path: '/home',
            element: <QuizBox quiz={quiz}/>,
            loader: () => ({quizzes: []}),
        },
    ], {initialEntries: ['/home']});
    return render(<RouterProvider router={router}/>);
};

describe('QuizBox', () => {
    beforeEach(() => {
        vi.mocked(socket.emit).mockClear();
        fetchMock.mockReset();
        localStorage.setItem('token', futureJwt());
    });

    it('renders the quiz name and the three actions', async () => {
        renderQuiz({name: 'Capitals quiz'});
        await screen.findByText('Capitals quiz');
        expect(screen.getByRole('button', {name: /start game/i})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /^edit$/i})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /delete quiz/i})).toBeInTheDocument();
    });

    it('renders the topic chip when topic is set', async () => {
        renderQuiz({topic: 'history'});
        // formatTopic capitalizes the first letter — adjust if your formatter differs.
        await screen.findByText(/history/i);
    });

    it('emits createQuizSession with the quiz id when Start game is clicked', async () => {
        const user = userEvent.setup();
        renderQuiz({id: 'abc-123'});

        await user.click(await screen.findByRole('button', {name: /start game/i}));

        expect(socket.emit).toHaveBeenCalledWith('createQuizSession', {quizId: 'abc-123'});
    });

    it('opens the Edit quiz modal when Edit is clicked', async () => {
        const user = userEvent.setup();
        renderQuiz({name: 'Original'});

        await user.click(await screen.findByRole('button', {name: /^edit$/i}));

        // The edit modal contains an h3 heading "Edit quiz".
        expect(await screen.findByRole('heading', {name: /edit quiz/i})).toBeInTheDocument();
    });

    it('opens the delete confirm modal when the trash button is clicked', async () => {
        const user = userEvent.setup();
        renderQuiz({name: 'Capitals quiz'});

        await user.click(await screen.findByRole('button', {name: /delete quiz/i}));

        expect(await screen.findByRole('heading', {name: /delete this quiz/i})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /^delete$/i})).toBeInTheDocument();
    });

    it('closes the confirm modal when Cancel is clicked', async () => {
        const user = userEvent.setup();
        renderQuiz();

        await user.click(await screen.findByRole('button', {name: /delete quiz/i}));
        await screen.findByRole('heading', {name: /delete this quiz/i});
        await user.click(screen.getByRole('button', {name: /cancel/i}));

        await waitFor(() => {
            expect(screen.queryByRole('heading', {name: /delete this quiz/i})).not.toBeInTheDocument();
        });
    });

    it('calls DELETE /quizzes/:id when Delete is confirmed', async () => {
        const user = userEvent.setup();
        fetchMock.mockResolvedValue({
            ok: true,
            status: 200,
            statusText: 'OK',
            text: async () => '',
        } as Response);

        renderQuiz({id: 'q-9'});

        await user.click(await screen.findByRole('button', {name: /delete quiz/i}));
        await user.click(screen.getByRole('button', {name: /^delete$/i}));

        await waitFor(() => {
            const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
            expect(lastCall?.[0]).toMatch(/\/quizzes\/q-9$/);
            expect((lastCall?.[1] as RequestInit | undefined)?.method).toBe('DELETE');
        });
    });

    it('surfaces the server error message when delete fails', async () => {
        const user = userEvent.setup();
        fetchMock.mockResolvedValue({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            text: async () => 'Database is on fire',
        } as Response);

        renderQuiz();

        await user.click(await screen.findByRole('button', {name: /delete quiz/i}));
        await user.click(screen.getByRole('button', {name: /^delete$/i}));

        expect(await screen.findByText(/Database is on fire/i)).toBeInTheDocument();
    });
});
