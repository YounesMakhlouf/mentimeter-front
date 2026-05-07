import {useEffect} from 'react';
import Podium from "../Components/Podium.tsx";
import LeaderboardList from "../Components/LeaderboardList.tsx";
import {Navigate, useLocation} from 'react-router';

const PAYLOAD_KEY = 'leaderboard:payload';

interface ScoredParticipant {
    id: string;
    name: string;
    avatar: string;
    score: number;
}

const readStored = (): ScoredParticipant[] | null => {
    const raw = sessionStorage.getItem(PAYLOAD_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as ScoredParticipant[];
    } catch {
        return null;
    }
};

const LeaderboardPage = () => {
    const {state} = useLocation();
    const participants: ScoredParticipant[] | null = state?.payload ?? readStored();

    useEffect(() => {
        if (participants) sessionStorage.setItem(PAYLOAD_KEY, JSON.stringify(participants));
    }, [participants]);

    if (!participants) {
        return <Navigate to="/" replace/>;
    }

    const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);
    const topParticipants = sortedParticipants.slice(0, 3);
    const restParticipants = sortedParticipants.slice(3);

    return (
        <div className="app wrapper flow">
            <Podium topParticipants={topParticipants}/>
            <LeaderboardList participants={restParticipants}/>
        </div>
    );
};

export default LeaderboardPage;
