import {describe, expect, it, vi, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import {createMemoryRouter, RouterProvider} from 'react-router';
import MainHomeBox from '../Components/MainHomeBox';

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

const renderWithLoaderData = (quizzes: {id: string; name: string}[]) => {
    const router = createMemoryRouter([
        {
            path: '/home',
            element: <MainHomeBox name="alice"/>,
            loader: () => ({quizzes}),
        },
        {path: '/startquiz', element: <div>start quiz page</div>},
    ], {initialEntries: ['/home']});
    return render(<RouterProvider router={router}/>);
};

describe('MainHomeBox', () => {
    beforeEach(() => {
        for (const k of Object.keys(handlers)) delete handlers[k];
    });

    it('greets the provided name', async () => {
        renderWithLoaderData([]);
        expect(await screen.findByText(/Hey alice/i)).toBeInTheDocument();
    });

    it('renders one QuizBox per quiz from the loader', async () => {
        renderWithLoaderData([
            {id: '1', name: 'Capitals'},
            {id: '2', name: 'Movies'},
            {id: '3', name: 'Sports'},
        ]);
        expect(await screen.findByText('Capitals')).toBeInTheDocument();
        expect(screen.getByText('Movies')).toBeInTheDocument();
        expect(screen.getByText('Sports')).toBeInTheDocument();
    });

    it('renders zero QuizBoxes when the user has no quizzes', async () => {
        renderWithLoaderData([]);
        await screen.findByText(/Hey alice/i);
        expect(screen.queryByText('Start Quiz')).not.toBeInTheDocument();
    });

    it('subscribes to QuizCreationSuccess on mount and unsubscribes on unmount', async () => {
        const {unmount} = renderWithLoaderData([]);
        await screen.findByText(/Hey alice/i);
        expect(handlers.QuizCreationSuccess).toHaveLength(1);
        unmount();
        expect(handlers.QuizCreationSuccess).toHaveLength(0);
    });
});
