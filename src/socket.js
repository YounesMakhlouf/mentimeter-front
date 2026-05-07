import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_SOCKET_URL, {
    auth: (cb) => cb({ token: localStorage.getItem('token') || null }),
});

export const reauthSocket = () => {
    socket.disconnect();
    socket.connect();
};
