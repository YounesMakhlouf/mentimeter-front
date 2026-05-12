import { jwtDecode } from 'jwt-decode';

export const API_URL = import.meta.env.VITE_API_URL;

export const getToken = () => localStorage.getItem('token');

export const isTokenValid = () => {
    const token = getToken();
    if (!token) return false;
    try {
        const { exp } = jwtDecode<{ exp: number }>(token);
        return exp * 1000 > Date.now();
    } catch {
        return false;
    }
};

export const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loginInfo');
    sessionStorage.removeItem('startquiz:sessionCode');
    sessionStorage.removeItem('qspage:quizCode');
    sessionStorage.removeItem('leaderboard:payload');
};

export const setAuth = (loginInfo: { email: string; username: string; accessToken: string }) => {
    localStorage.setItem('loginInfo', JSON.stringify(loginInfo));
    localStorage.setItem('token', loginInfo.accessToken);
};

export async function authFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
    const token = getToken();
    const res = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(init.headers ?? {}),
        },
    });
    if (res.status === 401) {
        clearAuth();
        window.dispatchEvent(new Event('app:unauthorized'));
        throw new Error('Unauthorized');
    }
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`${res.status} ${res.statusText}: ${body}`);
    }
    // Some endpoints (e.g. DELETE) reply 200/204 with an empty body — `res.json()`
    // throws "Unexpected end of JSON input" on that. Read as text and only parse if non-empty.
    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
}
