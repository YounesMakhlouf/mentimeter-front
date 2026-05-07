import {authFetch} from './api.ts';

export interface Quiz {
    id: string;
    name: string;
}

export const homeLoader = async (): Promise<{quizzes: Quiz[]}> => {
    const raw = localStorage.getItem('loginInfo');
    if (!raw) return {quizzes: []};
    const {email} = JSON.parse(raw);
    const quizzes = await authFetch<Quiz[]>(`/users/${email}/quizzes`);
    return {quizzes};
};
