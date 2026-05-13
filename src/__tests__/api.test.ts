import {describe, expect, it, beforeEach} from 'vitest';
import {clearAuth, getToken, isTokenValid, setAuth} from '../api';
import {local, session} from '../storage';
import {expiredJwt, futureJwt} from '../test/helpers';

describe('api', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
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
            // Seed and assert by iterating over the centralized key maps from
            // storage.ts — adding a new key there automatically gets covered
            // here, so the test can't drift like the old hand-rolled clearAuth
            // body did. (That drift is what let the participant's display
            // 'name' survive logout, which a future user then inherited.)
            for (const key of Object.values(local)) localStorage.setItem(key, 'seed');
            for (const key of Object.values(session)) sessionStorage.setItem(key, 'seed');

            clearAuth();

            for (const key of Object.values(local)) {
                expect(localStorage.getItem(key)).toBeNull();
            }
            for (const key of Object.values(session)) {
                expect(sessionStorage.getItem(key)).toBeNull();
            }
        });
    });
});
