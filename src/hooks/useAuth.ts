import { getToken, isTokenValid } from '../api';

interface LoginInfo {
    email: string;
    username: string;
    accessToken?: string;
}

const readLoginInfo = (): LoginInfo | null => {
    const raw = localStorage.getItem('loginInfo');
    if (!raw) return null;
    try {
        return JSON.parse(raw) as LoginInfo;
    } catch {
        return null;
    }
};

export const useAuth = () => {
    const info = readLoginInfo();
    return {
        email: info?.email,
        username: info?.username,
        token: getToken(),
        isAuthenticated: isTokenValid(),
    };
};
