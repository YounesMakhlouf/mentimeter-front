import {describe, expect, it, vi, beforeEach} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter, Route, Routes} from 'react-router';
import Authentication from '../Components/Authentication';
import {futureJwt} from '../test/helpers';

vi.mock('../socket.ts', () => ({
    reauthSocket: vi.fn(),
    socket: {on: vi.fn(), off: vi.fn(), emit: vi.fn()},
}));

const fetchMock = vi.fn();
globalThis.fetch = fetchMock as unknown as typeof fetch;

const renderApp = () =>
    render(
        <MemoryRouter initialEntries={['/authentication']}>
            <Routes>
                <Route path="/authentication" element={<Authentication/>}/>
                <Route path="/home" element={<div>home page</div>}/>
            </Routes>
        </MemoryRouter>,
    );

const fillSignIn = async (user: ReturnType<typeof userEvent.setup>, email: string, password: string) => {
    await user.type(screen.getByPlaceholderText('you@school.edu'), email);
    await user.type(screen.getByPlaceholderText('••••••••'), password);
    await user.click(screen.getByRole('button', {name: /^log in/i}));
};

describe('Authentication', () => {
    beforeEach(() => {
        localStorage.clear();
        fetchMock.mockReset();
    });

    it('persists the token and navigates to /home on successful login', async () => {
        fetchMock.mockResolvedValueOnce({
            json: async () => ({email: 'a@b.com', username: 'a', accessToken: 'TOKEN-XYZ'}),
        });
        const user = userEvent.setup();
        renderApp();
        await fillSignIn(user, 'a@b.com', 'password');

        await screen.findByText('home page');
        expect(localStorage.getItem('token')).toBe('TOKEN-XYZ');
        expect(JSON.parse(localStorage.getItem('loginInfo')!)).toMatchObject({
            email: 'a@b.com',
            username: 'a',
        });
    });

    it('renders the backend error message on a failed login', async () => {
        fetchMock.mockResolvedValueOnce({
            json: async () => ({statusCode: 401, message: ['bad credentials']}),
        });
        const user = userEvent.setup();
        renderApp();
        await fillSignIn(user, 'a@b.com', 'wrong');

        await screen.findByText('bad credentials');
        expect(localStorage.getItem('token')).toBeNull();
    });

    it('renders a connection error when the network rejects', async () => {
        fetchMock.mockRejectedValueOnce(new TypeError('NetworkError'));
        const user = userEvent.setup();
        renderApp();
        await fillSignIn(user, 'a@b.com', 'password');

        await screen.findByText(/Couldn't reach the server/i);
        expect(localStorage.getItem('token')).toBeNull();
    });

    it('refuses a 200 response that omits accessToken', async () => {
        fetchMock.mockResolvedValueOnce({
            json: async () => ({email: 'a@b.com', username: 'a'}),
        });
        const user = userEvent.setup();
        renderApp();
        await fillSignIn(user, 'a@b.com', 'password');

        await screen.findByText(/Login response missing token/i);
        expect(localStorage.getItem('token')).toBeNull();
        expect(screen.queryByText('home page')).not.toBeInTheDocument();
    });

    it('redirects to /home when an unexpired token is already in storage', async () => {
        localStorage.setItem('token', futureJwt());

        renderApp();
        await waitFor(() => expect(screen.getByText('home page')).toBeInTheDocument());
    });
});
