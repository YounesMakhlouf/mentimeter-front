import {io, Socket} from 'socket.io-client';

export interface QuestionOption {
    label: string;
    isCorrect?: boolean;
}

export interface QuestionPayload {
    questionNumber: number;
    question: {
        question: string;
        options: QuestionOption[];
    };
}

export interface Participant {
    playerName: string;
    avatar: string;
    score?: number;
    playerPseudo?: string;
}

export interface JoinQuizPayload {
    quizCode: string;
    playerName: string;
    avatar: string;
}

export interface CreateQuizSessionPayload {
    quizId: string;
}

export interface SendQuestionPayload {
    quizCode: string;
    questionNumber: number;
}

export interface GetAnswerPayload {
    quizCode: string;
    answer: string;
    questionNumber: number;
    playerPseudo: string | null;
}

export interface ServerToClientEvents {
    playerJoined: (participant: Participant) => void;
    errorMsg: (message: string) => void;
    QuizCreationSuccess: (sessionCode: string) => void;
    question: (payload: QuestionPayload) => void;
    endQuiz: (participants: Participant[]) => void;
}

export interface ClientToServerEvents {
    joinQuiz: (payload: JoinQuizPayload) => void;
    createQuizSession: (payload: CreateQuizSessionPayload) => void;
    sendQuestion: (payload: SendQuestionPayload) => void;
    getAnswer: (payload: GetAnswerPayload) => void;
}

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export const socket: AppSocket = io(import.meta.env.VITE_SOCKET_URL, {
    auth: (cb) => cb({token: localStorage.getItem('token') || null}),
});

export const reauthSocket = () => {
    socket.disconnect();
    socket.connect();
};
