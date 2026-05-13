import {describe, expect, it, beforeEach} from 'vitest';
import {clearAuth, getToken, isTokenValid, setAuth} from '../api';
import {expiredJwt, futureJwt} from '../test/helpers';

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
            localStorage.setItem('token', expiredJwt());
            expect(isTokenValid()).toBe(false);
        });

        it('returns true when the token has not expired', () => {
            localStorage.setItem('token', futureJwt());
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

        it('clearAuth wipes every storage key the app uses', () => {
            // Seed everything — auth, the participant's chosen name, and every
            // quiz-session sessionStorage key.
            setAuth({email: 'a@b.com', username: 'a', accessToken: 'xyz'});
            localStorage.setItem('name', 'Alice');
            sessionStorage.setItem('startquiz:sessionCode', '123456');
            sessionStorage.setItem('qspage:quizCode', '654321');
            sessionStorage.setItem('leaderboard:payload', '[]');

            clearAuth();

            // Auth gone.
            expect(localStorage.getItem('token')).toBeNull();
            expect(localStorage.getItem('loginInfo')).toBeNull();
            // Participant identity gone — regression: previously persisted after
            // logout so a fresh login inherited the previous user's display name.
            expect(localStorage.getItem('name')).toBeNull();
            // Every quiz-flow session key gone.
            expect(sessionStorage.getItem('startquiz:sessionCode')).toBeNull();
            expect(sessionStorage.getItem('qspage:quizCode')).toBeNull();
            expect(sessionStorage.getItem('leaderboard:payload')).toBeNull();
        });
    });
});
