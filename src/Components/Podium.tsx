const podiumStyles: Record<1 | 2 | 3, {avatarSize: number; fontSize: string}> = {
    1: {avatarSize: 100, fontSize: '1.5em'}, // First place
    2: {avatarSize: 75, fontSize: '1.2em'},  // Second place
    3: {avatarSize: 50, fontSize: '1em'}     // Third place
};

interface PodiumParticipant {
    id: string;
    name: string;
    avatar: string;
    score: number;
}

const Podium = ({topParticipants}: {topParticipants: PodiumParticipant[]}) => {
    return (<div className="podium">
        {topParticipants.map((participant, index) => {
            const place = (index + 1) as 1 | 2 | 3;
            const style = podiumStyles[place];
            return (<div key={participant.id} className={`podium-place place-${place}`}>
                <img src={participant.avatar} alt={`${participant.name}'s Avatar`} style={{
                    width: style.avatarSize,
                    height: style.avatarSize,
                    borderRadius: '50%',
                    border: '3px solid #fff',
                    marginBottom: '10px'
                }}/>
                <h3 style={{fontSize: style.fontSize}}>{participant.name}</h3>
                <p>Score: {participant.score}</p>
            </div>);
        })}
    </div>);
};

export default Podium;