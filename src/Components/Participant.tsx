interface ParticipantData {
    name: string;
    avatar: string;
    score: number;
}

const Participant = ({data}: {data: ParticipantData}) => (<div className="participant">
        <img src={data.avatar} alt={`${data.name}'s avatar`}
             style={{width: 50, height: 50, borderRadius: '50%', marginRight: 10}}/>
        <div className="stats">
            <h4>{data.name}</h4>
            <p>Score: {data.score}</p>
        </div>
    </div>);

export default Participant;
