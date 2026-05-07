import {CSSProperties, FormEvent, useEffect, useState} from 'react';
import {socket} from '../socket.ts'
import {randomPseudo} from "../utils/pseudoGenerator.ts"
import {Button} from "./Component.tsx";

type JoinStatus = 'idle' | 'submitting' | 'joined' | 'error';

const avatarStyle = {
    width: '65px', height: '65px', borderRadius: '50%', marginInline: "0.5rem"
};
const inputStyle = {
    minHeight: "3em", borderRadius: "50px", border: "none", paddingInlineStart: "1em", marginBlock: "1em"
}
const inputGroupStyle: CSSProperties = {
    display: "flex", flexDirection: "column", justifyContent: "center", marginBlockEnd: "1em"
}
const labelStyle = {
    marginLeft: "0.5em"
}
const errorStyle: CSSProperties = {
    color: "#bc2525", marginLeft: "0.5em"
}
const loadJoin: CSSProperties = {
    display: "flex", marginLeft: "0.5em", color: "#3a9188", flexDirection: "row", alignItems: "center"
}
const pacStyle = {
    width: "3em", marginRight: "1em"
}

const predefinedAvatars = ['https://robohash.org/1.png?set=set4', 'https://robohash.org/2.png?set=set4', 'https://robohash.org/3.png?set=set4', 'https://robohash.org/4.png?set=set4', 'https://robohash.org/5.png?set=set4', 'https://robohash.org/6.png?set=set4', 'https://robohash.org/7.png?set=set4', 'https://robohash.org/8.png?set=set4',];

const QuizJoinForm = () => {
    const [quizCode, setQuizCode] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(predefinedAvatars[0]);
    const [joinStatus, setJoinStatus] = useState<JoinStatus>('idle');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        socket.emit('joinQuiz', {quizCode, playerName, avatar: selectedAvatar});
        localStorage.setItem('name', playerName);
        setJoinStatus('submitting');
    }

    const handleAvatarSelect = (avatarUrl: string) => {
        setSelectedAvatar(avatarUrl);
    };

    useEffect(() => {
        const onError = () => setJoinStatus('error');
        const onJoined = () => setJoinStatus('joined');
        socket.on('errorMsg', onError);
        socket.on('playerJoined', onJoined);
        return () => {
            socket.off('errorMsg', onError);
            socket.off('playerJoined', onJoined);
        };
    }, []);

    const isLocked = joinStatus === 'submitting' || joinStatus === 'joined';

    return (<form onSubmit={handleSubmit}>
        <div style={inputGroupStyle}>
            <label style={labelStyle}>Quiz code </label>
            <input
                type="text"
                placeholder="7007024f-e0c7-46bb-8517-181c34968318"
                value={quizCode}
                onChange={(e) => setQuizCode(e.target.value)}
                style={inputStyle}
            />
        </div>
        <div style={inputGroupStyle}>
            <label style={labelStyle}>Your pseudo </label>
            <input
                type="text"
                placeholder={randomPseudo}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                style={inputStyle}
            />
        </div>
        {joinStatus === 'error' && (
            <div style={errorStyle}>
                Ooopsie! looks like this quiz doesn't exist !
            </div>
        )}
        <div>
            <p style={labelStyle}>Select an Avatar</p>
            <div style={{display: 'flex', justifyContent: 'center', marginBottom: '20px'}}>
                {predefinedAvatars.map((avatarUrl, index) => (<img
                    key={index}
                    src={avatarUrl}
                    alt={`Avatar ${index}`}
                    style={{...avatarStyle, border: avatarUrl === selectedAvatar ? '2px solid blue' : 'none'}}
                    onClick={() => handleAvatarSelect(avatarUrl)}
                />))}
            </div>
        </div>
        {joinStatus === 'joined' && (
            <div style={loadJoin}>
                Buckle up! joining quiz ..
                <img src="/assets/loader.gif" alt="loader" style={pacStyle}/>
            </div>
        )}
        <Button type="submit" disabled={isLocked}>
            {joinStatus === 'joined' ? 'Joined' : joinStatus === 'submitting' ? 'Joining…' : 'Join now'}
        </Button>
    </form>);
};

export default QuizJoinForm;
