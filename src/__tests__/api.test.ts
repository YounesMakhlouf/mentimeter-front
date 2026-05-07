import {describe, expect, it, beforeEach} from 'vitest';
import {clearAuth, getToken, isTokenValid, setAuth} from '../api';

const makeJwt = (payload: object) => {
    const header = btoa(JSON.stringify({alg: 'HS256', typ: 'JWT'}));
    const body = btoa(JSON.stringify(payload));
    return `${header}.${body}.sig`;
};

describe('api', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('getToken', () => {
        it('returns null when not set', () => {
            expect(getToken()).toBeNull();
        });

        it('returns the stored token', () => {
            localStorage.setItem('token', 'abc');
            expect(getToken()).toBe('abc');
        });
    });

    describe('isTokenValid', () => {
        it('returns false when there is no token', () => {
            expect(isTokenValid()).toBe(false);
        });

        it('returns false when the token is malformed', () => {
            localStorage.setItem('token', 'not-a-jwt');
            expect(isTokenValid()).toBe(false);
        });

        it('returns false when the token is expired', () => {
            const past = Math.floor(Date.now() / 1000) - 60;
            localStorage.setItem('token', makeJwt({exp: past}));
            expect(isTokenValid()).toBe(false);
        });

        it('returns true when the token has not expired', () => {
            const future = Math.floor(Date.now() / 1000) + 3600;
            localStorage.setItem('token', makeJwt({exp: future}));
            expect(isTokenValid()).toBe(true);
        });
    });

    describe('setAuth / clearAuth', () => {
        it('writes both loginInfo and token from a login response', () => {
            setAuth({email: 'a@b.com', username: 'a', accessToken: 'xyz'});
            expect(localStorage.getItem('token')).toBe('xyz');
            expect(JSON.parse(localStorage.getItem('loginInfo')!)).toEqual({
                email: 'a@b.com',
                username: 'a',
                accessToken: 'xyz',
            });
        });

        it('clearAuth removes both keys', () => {
            setAuth({email: 'a@b.com', username: 'a', accessToken: 'xyz'});
            clearAuth();
            expect(localStorage.getItem('token')).toBeNull();
            expect(localStorage.getItem('loginInfo')).toBeNull();
        });
    });
});
