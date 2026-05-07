import Navbar from "../Components/Navbar.tsx";
import Popup from "reactjs-popup";
import {FaRegCircleXmark} from "react-icons/fa6";
import {useEffect, useState} from "react";
import styled from "styled-components";
import EnterQuizCodeForm from "../Components/EnterQuizCodeForm.tsx";
import Typewriter from 'typewriter-effect';
import {socket, QuestionPayload} from "../socket.ts";
import {useNavigate} from "react-router";

const ModalBox = styled.div`
    width: 60%;
    height: auto;
    background-color: #F6F5F2;
    border-radius: 12px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    padding: 0.5em 2em;
`;

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(6px);
    z-index: 0;
`;

const CloseIcon = styled(FaRegCircleXmark)`
    height: 1.5em;
    width: 1.5em;
    align-self: flex-end;
`;

const Hero = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 1em;
`;

const Tagline = styled.div`
    min-width: 200px;
    margin-right: 1em;
    font-size: 3rem;
    width: 60%;
    color: #6C0345;
`;

const SideImage = styled.img`
    max-width: 50%;
    height: auto;
`;

const phrases = [
    'Are You a Quiz Whiz?',
    "Wanna  Be Everyone's <i>favourite</i> teacher?",
    'Your quiz session on another <span style="color: #cd7f32">level!</span>',
    'Fun, Fast, and Full of Facts!',
    'Join the Fun – Start a Quiz <span style="color: #cd7f32">Now!</span>'
];

function WelcomePage() {
    const [open, setOpen] = useState(false);
    const closeModal = () => setOpen(false);
    const navigate = useNavigate();

    useEffect(() => {
        const onQuestion = (data: QuestionPayload) => {
            navigate('/qspage', {state: {payload: data}});
        };
        socket.on('question', onQuestion);
        return () => {
            socket.off('question', onQuestion);
        };
    }, [navigate]);

    return (
        <>
            <Navbar open={open} setOpen={setOpen}/>
            {open && <ModalOverlay onClick={closeModal}/>}
            <Popup open={open} closeOnDocumentClick onClose={closeModal}>
                <ModalBox className="modal">
                    <a className="close" onClick={closeModal}>
                        <CloseIcon/>
                    </a>
                    <EnterQuizCodeForm/>
                </ModalBox>
            </Popup>
            <Hero className="welcome-container">
                <Tagline>
                    <Typewriter
                        options={{
                            strings: phrases,
                            autoStart: true,
                            loop: true,
                            delay: 75,
                        }}
                    />
                </Tagline>
                <SideImage src="/assets/welcome.webp" alt="brika bel thon"/>
            </Hero>
        </>
    );
}

export default WelcomePage;
