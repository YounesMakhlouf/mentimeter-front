import { jwtDecode } from 'jwt-decode';
import { local, wipeStoredState } from './storage';

export const API_URL = import.meta.env.VITE_API_URL;

export const getToken = () => localStorage.getItem(local.token);

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

/**
 * Logout / 401 handler. Wipes every stored bit of user state so a new user landing in the same tab can't resume the previous one.
 */
export const clearAuth = wipeStoredState;

export const setAuth = (loginInfo: { email: string; username: string; accessToken: string }) => {
    localStorage.setItem(local.loginInfo, JSON.stringify(loginInfo));
    localStorage.setItem(local.token, loginInfo.accessToken);
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
    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
}
