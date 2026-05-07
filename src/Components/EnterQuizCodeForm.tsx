import {FormEvent, useEffect, useState} from 'react';
import styled from 'styled-components';
import {socket} from '../socket.ts'
import {randomPseudo} from "../utils/pseudoGenerator.ts"
import {Button} from "./Component.tsx";

type JoinStatus = 'idle' | 'submitting' | 'joined' | 'error';

const InputGroup = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-block-end: 1em;
`;

const InputLabel = styled.label`
    margin-left: 0.5em;
`;

const TextInput = styled.input`
    min-height: 3em;
    border-radius: 50px;
    border: none;
    padding-inline-start: 1em;
    margin-block: 1em;
`;

const ErrorMessage = styled.div`
    color: #bc2525;
    margin-left: 0.5em;
`;

const SuccessLoader = styled.div`
    display: flex;
    margin-left: 0.5em;
    color: #3a9188;
    flex-direction: row;
    align-items: center;
`;

const LoaderIcon = styled.img`
    width: 3em;
    margin-right: 1em;
`;

const AvatarRow = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
`;

const AvatarOption = styled.img<{$selected: boolean}>`
    width: 65px;
    height: 65px;
    border-radius: 50%;
    margin-inline: 0.5rem;
    border: ${({$selected}) => $selected ? '2px solid blue' : 'none'};
`;

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

    return (
        <form onSubmit={handleSubmit}>
            <InputGroup>
                <InputLabel>Quiz code </InputLabel>
                <TextInput
                    type="text"
                    placeholder="7007024f-e0c7-46bb-8517-181c34968318"
                    value={quizCode}
                    onChange={(e) => setQuizCode(e.target.value)}
                />
            </InputGroup>
            <InputGroup>
                <InputLabel>Your pseudo </InputLabel>
                <TextInput
                    type="text"
                    placeholder={randomPseudo}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                />
            </InputGroup>
            {joinStatus === 'error' && (
                <ErrorMessage>Ooopsie! looks like this quiz doesn't exist !</ErrorMessage>
            )}
            <div>
                <InputLabel as="p">Select an Avatar</InputLabel>
                <AvatarRow>
                    {predefinedAvatars.map((avatarUrl, index) => (
                        <AvatarOption
                            key={index}
                            src={avatarUrl}
                            alt={`Avatar ${index}`}
                            $selected={avatarUrl === selectedAvatar}
                            onClick={() => setSelectedAvatar(avatarUrl)}
                        />
                    ))}
                </AvatarRow>
            </div>
            {joinStatus === 'joined' && (
                <SuccessLoader>
                    Buckle up! joining quiz ..
                    <LoaderIcon src="/assets/loader.gif" alt="loader"/>
                </SuccessLoader>
            )}
            <Button type="submit" disabled={isLocked}>
                {joinStatus === 'joined' ? 'Joined' : joinStatus === 'submitting' ? 'Joining…' : 'Join now'}
            </Button>
        </form>
    );
};

export default QuizJoinForm;
