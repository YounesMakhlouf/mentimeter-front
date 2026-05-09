import {describe, expect, it, beforeEach} from 'vitest';
import {render, screen} from '@testing-library/react';
import {MemoryRouter, Route, Routes} from 'react-router';
import PrivateRoutes from '../Components/PrivateRoutes';
import {expiredJwt, futureJwt} from '../test/helpers';

const renderAt = (path: string) =>
    render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route element={<PrivateRoutes/>}>
                    <Route path="/home" element={<div>protected</div>}/>
                </Route>
                <Route path="/authentication" element={<div>auth page</div>}/>
            </Routes>
        </MemoryRouter>,
    );

describe('PrivateRoutes', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('redirects to /authentication when no token is set', () => {
        renderAt('/home');
        expect(screen.getByText('auth page')).toBeInTheDocument();
        expect(screen.queryByText('protected')).not.toBeInTheDocument();
    });

    it('redirects to /authentication when the token is expired', () => {
        localStorage.setItem('token', expiredJwt());
        renderAt('/home');
        expect(screen.getByText('auth page')).toBeInTheDocument();
    });

    it('clears stale auth before redirecting', () => {
        localStorage.setItem('token', 'malformed');
        localStorage.setItem('loginInfo', JSON.stringify({email: 'a@b'}));
        renderAt('/home');
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('loginInfo')).toBeNull();
    });

    it('renders the protected route when the token is valid', () => {
        localStorage.setItem('token', futureJwt());
        renderAt('/home');
        expect(screen.getByText('protected')).toBeInTheDocument();
        expect(screen.queryByText('auth page')).not.toBeInTheDocument();
    });
});
