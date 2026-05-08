import {describe, expect, it, vi, beforeEach} from 'vitest';
import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EnterQuizCodeForm from '../Components/EnterQuizCodeForm';
import {EMOJI_AVATARS} from '../design/avatars';

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

const fillNameAndContinue = async (user: ReturnType<typeof userEvent.setup>, code: string, name: string) => {
    await user.type(screen.getByPlaceholderText('123 456'), code);
    const nameInput = screen.getAllByRole('textbox')[1];
    await user.type(nameInput, name);
    await user.click(screen.getByRole('button', {name: /continue/i}));
};

describe('EnterQuizCodeForm', () => {
    beforeEach(() => {
        for (const key of Object.keys(handlers)) delete handlers[key];
        vi.mocked(socket.emit).mockClear();
        localStorage.clear();
    });

    it('walks name -> avatar -> emits joinQuiz with a normalized 6-digit pin', async () => {
        const user = userEvent.setup();
        render(<EnterQuizCodeForm/>);

        await fillNameAndContinue(user, '123 456', 'Alice');
        // We're on the avatar step now
        expect(screen.getByText(/Pick your buddy/i)).toBeInTheDocument();
        await user.click(screen.getByRole('button', {name: /join game/i}));

        expect(socket.emit).toHaveBeenCalledWith('joinQuiz', {
            quizCode: '123456',
            playerName: 'Alice',
            avatar: EMOJI_AVATARS[0],
        });
        expect(localStorage.getItem('name')).toBe('Alice');
    });

    it('disables Continue while quiz code or pseudo are empty', async () => {
        render(<EnterQuizCodeForm/>);
        const continueBtn = screen.getByRole('button', {name: /continue/i});
        expect(continueBtn).toBeDisabled();
    });

    it('flips to the joined state when playerJoined fires', () => {
        render(<EnterQuizCodeForm initialCode="CODE"/>);
        trigger('playerJoined');
        expect(screen.getByText(/You're in/i)).toBeInTheDocument();
    });

    it('shows the error message when errorMsg fires', async () => {
        const user = userEvent.setup();
        render(<EnterQuizCodeForm/>);
        await fillNameAndContinue(user, '123456', 'Alice');
        trigger('errorMsg');
        expect(screen.getByText(/Ooopsie/i)).toBeInTheDocument();
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
