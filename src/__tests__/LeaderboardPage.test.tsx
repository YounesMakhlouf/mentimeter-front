import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter, Route, Routes} from 'react-router';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import LeaderboardPage from '../pages/LeaderboardPage';

interface ScoredParticipant {
    playerName?: string;
    name?: string;
    avatar?: string;
    score: number;
}

const renderAt = (state: unknown) =>
    render(
        <MemoryRouter initialEntries={[{pathname: '/leaderboard', state}]}>
            <Routes>
                <Route path="/leaderboard" element={<LeaderboardPage/>}/>
                <Route path="/" element={<div>welcome route</div>}/>
                <Route path="/home" element={<div>home route</div>}/>
            </Routes>
        </MemoryRouter>,
    );

const PAYLOAD_KEY = 'leaderboard:payload';

describe('LeaderboardPage', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    it('redirects to / when there is no payload anywhere', () => {
        renderAt(undefined);
        expect(screen.getByText('welcome route')).toBeInTheDocument();
    });

    it('renders Game over! title with the player count', () => {
        const payload: ScoredParticipant[] = [
            {playerName: 'Alice', avatar: '🦊', score: 100},
            {playerName: 'Bob', avatar: '🐼', score: 50},
        ];
        renderAt({payload});

        expect(screen.getByText('Game over!')).toBeInTheDocument();
        expect(screen.getByText(/2 players/)).toBeInTheDocument();
    });

    it('uses the singular "1 player" when there is exactly one participant', () => {
        renderAt({payload: [{playerName: 'Solo', avatar: '🦊', score: 0}]});
        expect(screen.getByText(/1 player\b/)).toBeInTheDocument();
    });

    it('renders cleanly with a single participant (regression: duplicate podium keys)', () => {
        // With 1 player, podiumOrder=[1,0,2] produces two empty slots and one
        // PodiumCol. Keying by podiumIdx used to collide with the empty <div
        // key={slot}/> at slot 0. Keying by slot fixes it; React would warn
        // about duplicate keys if it didn't.
        const warn = vi.spyOn(console, 'error').mockImplementation(() => {});
        renderAt({payload: [{playerName: 'Solo', avatar: '🦊', score: 42}]});
        expect(screen.getByText('Solo')).toBeInTheDocument();
        const dupKeyWarning = warn.mock.calls.find(
            (args: unknown[]) => typeof args[0] === 'string' && args[0].includes('two children with the same key'),
        );
        expect(dupKeyWarning).toBeUndefined();
        warn.mockRestore();
    });

    it('sorts participants by score descending — top 3 on the podium, rest in the list', () => {
        const payload: ScoredParticipant[] = [
            {playerName: 'C', avatar: '🦊', score: 30},
            {playerName: 'A', avatar: '🐼', score: 100},
            {playerName: 'D', avatar: '🦉', score: 21},
            {playerName: 'B', avatar: '🐸', score: 50},
            {playerName: 'E', avatar: '🐻', score: 17},
        ];
        renderAt({payload});

        // Top 3 (A=100, B=50, C=30) appear on the podium.
        for (const name of ['A', 'B', 'C']) {
            expect(screen.getByText(name)).toBeInTheDocument();
        }
        // 4th and 5th appear in the rest list.
        expect(screen.getByText('D')).toBeInTheDocument();
        expect(screen.getByText('E')).toBeInTheDocument();
        // Ranks 4 and 5 are present (using regex anchored to nothing else around).
        expect(screen.getByText(/^4$/)).toBeInTheDocument();
        expect(screen.getByText(/^5$/)).toBeInTheDocument();
    });

    it('falls back to sessionStorage when route state has no payload', () => {
        const stored: ScoredParticipant[] = [{playerName: 'Restored', avatar: '🦊', score: 42}];
        sessionStorage.setItem(PAYLOAD_KEY, JSON.stringify(stored));
        renderAt(undefined);
        expect(screen.getByText('Restored')).toBeInTheDocument();
    });

    it('persists the payload to sessionStorage on mount', () => {
        const payload: ScoredParticipant[] = [{playerName: 'Alice', avatar: '🦊', score: 100}];
        renderAt({payload});
        expect(sessionStorage.getItem(PAYLOAD_KEY)).toBe(JSON.stringify(payload));
    });

    it('falls back to "Player" when neither playerName nor name is provided', () => {
        renderAt({payload: [{avatar: '🦊', score: 1}]});
        expect(screen.getByText('Player')).toBeInTheDocument();
    });

    it('navigates to / when Done is clicked', async () => {
        const user = userEvent.setup();
        renderAt({payload: [{playerName: 'Alice', avatar: '🦊', score: 1}]});

        await user.click(screen.getByRole('button', {name: /^done$/i}));

        expect(screen.getByText('welcome route')).toBeInTheDocument();
    });

    it('navigates to /home when Host another is clicked', async () => {
        const user = userEvent.setup();
        renderAt({payload: [{playerName: 'Alice', avatar: '🦊', score: 1}]});

        await user.click(screen.getByRole('button', {name: /host another/i}));

        expect(screen.getByText('home route')).toBeInTheDocument();
    });

    it('shows the formatted score on the podium', () => {
        renderAt({payload: [{playerName: 'Alice', avatar: '🦊', score: 12345}]});
        // toLocaleString in en-* renders 12,345; jsdom may use the user locale, just check the digits + a separator.
        expect(screen.getByText(/12.345/)).toBeInTheDocument();
    });

    // sanity: the avatar emoji renders for top-3
    it('renders each participant’s avatar', () => {
        const payload: ScoredParticipant[] = [
            {playerName: 'Alice', avatar: '🦊', score: 10},
            {playerName: 'Bob', avatar: '🐼', score: 5},
        ];
        const {container} = renderAt({payload});
        // emojis live as text nodes inside the avatar faces; just check both are present somewhere on the page
        expect(within(container).getByText('🦊')).toBeInTheDocument();
        expect(within(container).getByText('🐼')).toBeInTheDocument();
    });
});
