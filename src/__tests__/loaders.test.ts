import {describe, expect, it, vi, beforeEach} from 'vitest';
import {homeLoader} from '../loaders';
import * as api from '../api';

describe('homeLoader', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it('returns an empty list when there is no loginInfo', async () => {
        const spy = vi.spyOn(api, 'authFetch');
        const result = await homeLoader();
        expect(result).toEqual({quizzes: []});
        expect(spy).not.toHaveBeenCalled();
    });

    it('calls /users/:email/quizzes with the email from loginInfo', async () => {
        localStorage.setItem('loginInfo', JSON.stringify({email: 'a@b.com', username: 'a'}));
        const fakeQuizzes = [{id: '1', name: 'first'}, {id: '2', name: 'second'}];
        const spy = vi.spyOn(api, 'authFetch').mockResolvedValueOnce(fakeQuizzes);

        const result = await homeLoader();

        expect(spy).toHaveBeenCalledWith('/users/a@b.com/quizzes');
        expect(result).toEqual({quizzes: fakeQuizzes});
    });

    it('propagates authFetch failures (the router error boundary catches them)', async () => {
        localStorage.setItem('loginInfo', JSON.stringify({email: 'a@b.com', username: 'a'}));
        vi.spyOn(api, 'authFetch').mockRejectedValueOnce(new Error('boom'));

        await expect(homeLoader()).rejects.toThrow('boom');
    });
});
