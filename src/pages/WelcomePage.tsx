import Navbar from "../Components/Navbar.tsx";
import Popup from "reactjs-popup";
import { FaRegCircleXmark } from "react-icons/fa6";
import {CSSProperties, useEffect, useState} from "react";
import EnterQuizCodeForm from "../Components/EnterQuizCodeForm.tsx";
import Typewriter from 'typewriter-effect';
import {socket, QuestionPayload} from "../socket.ts";
import {useNavigate} from "react-router";


function WelcomePage() {
    const [open, setOpen] = useState(false);
    const closeModal = () => setOpen(false);
    const navigate = useNavigate()

    const modalStyle: CSSProperties = {
        width: "60%",
        height: "auto",
        backgroundColor: "#F6F5F2",
        borderRadius: "12px",
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        padding: "0.5em 2em"
    };

    const overlayStyle: CSSProperties = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backdropFilter: "blur(6px)", // Apply a blur effect
        zIndex: 0, // Ensure the overlay is below the modal
    };

    const containerStyle: CSSProperties = {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: "1em",
    };

    const typewriterContainerStyle: CSSProperties = {
        minWidth: "200px",
        marginRight: "1em",
        fontSize: "3rem",
        width: "60%",
        color: "#6C0345",
    };

    const sideImageStyle: CSSProperties = {
        maxWidth: "50%",
        height: "auto"
    };

    const phrases = [
        'Are You a Quiz Whiz?',
        "Wanna  Be Everyone's <i>favourite</i> teacher?",
        'Your quiz session on another <span style="color: #cd7f32">level!</span>',
        'Fun, Fast, and Full of Facts!',
        'Join the Fun – Start a Quiz <span style="color: #cd7f32">Now!</span>'
    ];
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
            <Navbar open={open} setOpen={setOpen} />
            {open && <div style={overlayStyle} onClick={closeModal}></div>}
            <Popup
                open={open}
                closeOnDocumentClick
                onClose={closeModal} >
                <div className="modal" style={modalStyle}>
                    <a className="close" onClick={closeModal}>
                        <FaRegCircleXmark style={{ height: "1.5em", width: "1.5em", alignSelf: "flex-end" }} />
                    </a>
                    <EnterQuizCodeForm />
                </div>
            </Popup>
            <div className="welcome-container" style={containerStyle}>
                    <div style={typewriterContainerStyle}>
                        <Typewriter
                            options={{
                                strings: phrases,
                                autoStart: true,
                                loop: true,
                                delay: 75 // Small delay before starting the typewriter effect
                            }}
                        />
                    </div>
                <img src="/assets/welcome.webp" alt="brika bel thon" style={sideImageStyle} />
            </div>
        </>
    );
}

export default WelcomePage;
