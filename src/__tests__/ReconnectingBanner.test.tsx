import {act, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ReconnectingBanner} from '../components/ReconnectingBanner';

type Handler = (...args: unknown[]) => void;
const handlers: Record<string, Handler[]> = {};
const socketState = {connected: false};

vi.mock('../socket.ts', () => ({
    socket: {
        get connected() {
            return socketState.connected;
        },
        on: vi.fn((event: string, handler: Handler) => {
            (handlers[event] ||= []).push(handler);
        }),
        off: vi.fn((event: string, handler: Handler) => {
            handlers[event] = (handlers[event] || []).filter((h) => h !== handler);
        }),
        emit: vi.fn(),
    },
}));

const trigger = (event: string) => {
    act(() => {
        (handlers[event] || []).forEach((h) => h());
    });
};

describe('ReconnectingBanner', () => {
    beforeEach(() => {
        for (const key of Object.keys(handlers)) delete handlers[key];
        socketState.connected = false;
    });

    it('renders nothing on first mount when the socket has never connected', () => {
        // Prevents the banner from flashing during the initial connection
        // handshake on a fresh page load.
        render(<ReconnectingBanner/>);
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('appears with a polite aria-live announcement after a disconnect that follows a successful connect', () => {
        render(<ReconnectingBanner/>);

        trigger('connect');
        trigger('disconnect');

        const status = screen.getByRole('status');
        expect(status).toHaveTextContent(/reconnecting/i);
        expect(status).toHaveAttribute('aria-live', 'polite');
    });

    it('hides again once the socket reconnects', () => {
        render(<ReconnectingBanner/>);

        trigger('connect');
        trigger('disconnect');
        expect(screen.getByRole('status')).toBeInTheDocument();

        trigger('connect');
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('starts visible if the socket reports `connected: true` at mount (then drops)', () => {
        // Hot-reload / route change scenario: the socket has been live for a
        // while, the banner mounts, then a drop happens.
        socketState.connected = true;
        render(<ReconnectingBanner/>);
        expect(screen.queryByRole('status')).not.toBeInTheDocument();

        trigger('disconnect');
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('cleans up the connect / disconnect listeners on unmount', () => {
        const {unmount} = render(<ReconnectingBanner/>);
        expect(handlers.connect).toHaveLength(1);
        expect(handlers.disconnect).toHaveLength(1);

        unmount();
        expect(handlers.connect).toHaveLength(0);
        expect(handlers.disconnect).toHaveLength(0);
    });
});
