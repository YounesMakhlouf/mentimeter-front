import Popup from 'reactjs-popup';
import {FaPlusCircle} from "react-icons/fa";
import {useState} from "react";
import {FaRegCircleXmark} from "react-icons/fa6";
import styled from "styled-components";
import CreateQuizForm from "./CreateQuizForm.tsx";

const TriggerButton = styled.button`
    display: flex;
    align-items: center;
    height: 4em;
    border-radius: 50px;
    font-size: 1.1rem;
`;

const PlusIcon = styled(FaPlusCircle)`
    margin-right: 1em;
`;

const ModalBox = styled.div`
    width: 60%;
    height: auto;
    background-color: #F6F5F2;
    border-radius: 12px;
    position: fixed;
    top: 50%;
    left: 56%;
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

export default function CreateQuizPopup() {
    const [open, setOpen] = useState(false);
    const closeModal = () => setOpen(false);
    return (
        <div>
            <TriggerButton type="button" className="button" onClick={() => setOpen((o) => !o)}>
                <PlusIcon/>New Quiz
            </TriggerButton>
            {open && <ModalOverlay onClick={closeModal}/>}
            <Popup open={open} closeOnDocumentClick onClose={closeModal}>
                <ModalBox className="modal">
                    <a className="close" onClick={closeModal}>
                        <CloseIcon/>
                    </a>
                    <CreateQuizForm/>
                </ModalBox>
            </Popup>
        </div>
    );
}
