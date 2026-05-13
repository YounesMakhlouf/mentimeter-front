import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter, Route, Routes} from 'react-router';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {Participant} from '../socket';
import StartQuizPage from '../pages/StartQuizPage';

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

const renderAt = (state: unknown) =>
    render(
        <MemoryRouter initialEntries={[{pathname: '/startquiz', state}]}>
            <Routes>
                <Route path="/startquiz" element={<StartQuizPage/>}/>
                <Route path="/home" element={<div>home route</div>}/>
                <Route path="/present" element={<div>presenter route</div>}/>
            </Routes>
        </MemoryRouter>,
    );

const player = (playerName: string, avatar = '🦊'): Participant => ({playerName, avatar});

describe('StartQuizPage', () => {
    beforeEach(() => {
        for (const key of Object.keys(handlers)) delete handlers[key];
        vi.mocked(socket.emit).mockClear();
        sessionStorage.clear();
    });

    it('redirects to /home when there is no sessionCode in state or sessionStorage', () => {
        renderAt({});
        expect(screen.getByText('home route')).toBeInTheDocument();
    });

    it('persists the sessionCode to sessionStorage on mount', () => {
        renderAt({sessionCode: '789012'});
        expect(sessionStorage.getItem('startquiz:sessionCode')).toBe('789012');
    });

    it('disables the Start button and shows the waiting label when there are no participants', () => {
        renderAt({sessionCode: '789012'});
        const startBtn = screen.getByRole('button', {name: /waiting for players/i});
        expect(startBtn).toBeDisabled();
    });

    it('appends a participant when playerJoined fires and shows them in the room panel', () => {
        renderAt({sessionCode: '789012'});

        trigger('playerJoined', player('Alice', '🦊'));

        expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('enables the Start button after at least one player joins and shows the count', () => {
        renderAt({sessionCode: '789012'});
        trigger('playerJoined', player('Alice'));

        const startBtn = screen.getByRole('button', {name: /start now \(1\)/i});
        expect(startBtn).toBeEnabled();
    });

    it('emits sendQuestion with questionNumber 0 and navigates to the presenter when Start is clicked', async () => {
        const user = userEvent.setup();
        renderAt({sessionCode: '789012'});
        trigger('playerJoined', player('Alice'));

        await user.click(screen.getByRole('button', {name: /start now/i}));

        expect(socket.emit).toHaveBeenCalledWith('sendQuestion', {
            quizCode: '789012',
            questionNumber: 0,
        });
        expect(screen.getByText('presenter route')).toBeInTheDocument();
    });

    it('navigates to /home when End game is clicked', async () => {
        const user = userEvent.setup();
        renderAt({sessionCode: '789012'});

        await user.click(screen.getByRole('button', {name: /end game/i}));

        expect(screen.getByText('home route')).toBeInTheDocument();
    });

    it('cleans up the playerJoined listener on unmount', () => {
        const {unmount} = renderAt({sessionCode: '789012'});
        expect(handlers.playerJoined).toHaveLength(1);
        unmount();
        expect(handlers.playerJoined).toHaveLength(0);
    });
});
