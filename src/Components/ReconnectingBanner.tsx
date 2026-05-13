import {useEffect, useState} from 'react';
import styled from 'styled-components';
import {socket} from '../socket.ts';

const Banner = styled.div`
    position: fixed;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    pointer-events: none;
    display: flex;
    align-items: center;
    gap: var(--gap-2);
    padding: 0.5rem 1rem;
    border-radius: 999px;
    border: 2.5px solid var(--ink);
    background: var(--ink);
    color: var(--paper);
    font-weight: 600;
    font-size: var(--step--1);
    box-shadow: var(--shadow-md);
`;

const Pulse = styled.span`
    width: 0.5rem;
    height: 0.5rem;
    background: var(--opt-a);
    border-radius: 50%;
    animation: pulse-ring 1.4s ease-out infinite;
`;

/**
 * Toast at the top of the viewport that appears whenever the live socket
 * drops. socket.io auto-retries with exponential backoff; this just makes the
 * disconnect visible so the host's bar chart freezing or the player's submit
 * sitting in a queue isn't silent.
 *
 * Hidden on the very first render until the socket has connected at least
 * once — otherwise a fresh page load would briefly flash "Reconnecting…"
 * while the initial connection is still establishing.
 */
export const ReconnectingBanner = () => {
    const [connected, setConnected] = useState(socket.connected);
    const [hasEverConnected, setHasEverConnected] = useState(socket.connected);

    useEffect(() => {
        const onConnect = () => {
            setConnected(true);
            setHasEverConnected(true);
        };
        const onDisconnect = () => setConnected(false);
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
        };
    }, []);

    if (connected || !hasEverConnected) return null;

    return (
        <Banner role="status" aria-live="polite">
            <Pulse aria-hidden="true"/>
            Reconnecting…
        </Banner>
    );
};
