import Participant from './Participant';

interface ParticipantEntry {
    name: string;
    avatar: string;
    score: number;
}

const LeaderboardList = ({participants}: {participants: ParticipantEntry[]}) => {
    return (<div className="leaderboard-list">
        {participants.map(participant => (<Participant key={participant.name} data={participant}/>))}
    </div>);
};

export default LeaderboardList;