import Podium from "../Components/Podium.tsx";
import LeaderboardList from "../Components/LeaderboardList.tsx";
import {Navigate, useLocation} from 'react-router-dom';


const LeaderboardPage = () => {
    const {state} = useLocation();
    if (!state?.payload) {
        return <Navigate to="/" replace />;
    }
    const participants = state.payload;
    const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);
    const topParticipants = sortedParticipants.slice(0, 3);
    const restParticipants = sortedParticipants.slice(3);

    return (<div className="app wrapper flow">
        <Podium topParticipants={topParticipants}/>
        <LeaderboardList participants={restParticipants}/>
    </div>);
};

export default LeaderboardPage;
