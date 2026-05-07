import {describe, expect, it, vi, beforeEach} from 'vitest';
import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EnterQuizCodeForm from '../Components/EnterQuizCodeForm';

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

describe('EnterQuizCodeForm', () => {
    beforeEach(() => {
        for (const key of Object.keys(handlers)) delete handlers[key];
        vi.mocked(socket.emit).mockClear();
        localStorage.clear();
    });

    it('emits joinQuiz with the typed values and locks the button', async () => {
        const user = userEvent.setup();
        render(<EnterQuizCodeForm/>);

        await user.type(screen.getByPlaceholderText(/7007024f/), 'CODE-123');
        await user.type(screen.getByPlaceholderText(/The/), 'Alice');
        await user.click(screen.getByRole('button', {name: /join now/i}));

        expect(socket.emit).toHaveBeenCalledWith('joinQuiz', expect.objectContaining({
            quizCode: 'CODE-123',
            playerName: 'Alice',
        }));
        expect(localStorage.getItem('name')).toBe('Alice');
        expect(screen.getByRole('button', {name: /joining/i})).toBeDisabled();
    });

    it('shows the success loader and disables the button when playerJoined fires', () => {
        render(<EnterQuizCodeForm/>);
        trigger('playerJoined');
        expect(screen.getByText(/Buckle up/i)).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /joined/i})).toBeDisabled();
    });

    it('shows the error message and re-enables the button when errorMsg fires', () => {
        render(<EnterQuizCodeForm/>);
        trigger('errorMsg');
        expect(screen.getByText(/Ooopsie/i)).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /join now/i})).toBeEnabled();
    });

    it('cleans up listeners on unmount', () => {
        const {unmount} = render(<EnterQuizCodeForm/>);
        expect(handlers.errorMsg).toHaveLength(1);
        expect(handlers.playerJoined).toHaveLength(1);
        unmount();
        expect(handlers.errorMsg).toHaveLength(0);
        expect(handlers.playerJoined).toHaveLength(0);
    });
});
