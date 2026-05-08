import {useState} from "react";
import Popup from 'reactjs-popup';
import {FaRegCircleXmark} from "react-icons/fa6";
import styled from "styled-components";
import CreateQuizForm from "./CreateQuizForm.tsx";
import {XLargeButton} from "../design/styled.ts";

const TriggerButton = styled(XLargeButton)`
    background: var(--brand);
    color: var(--brand-ink);
`;

const ModalBox = styled.div`
    width: min(560px, calc(100% - 32px));
    background: var(--card);
    border: 2.5px solid var(--ink);
    border-radius: var(--r-xl);
    box-shadow: var(--shadow-xl);
    padding: 28px 32px 32px;
    position: relative;
`;

const ModalClose = styled.button`
    position: absolute;
    top: 16px;
    right: 16px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--ink);
    padding: 4px;
`;

export default function CreateQuizPopup() {
    const [open, setOpen] = useState(false);
    const closeModal = () => setOpen(false);
    return (
        <>
            <TriggerButton type="button" onClick={() => setOpen(true)}>
                ＋ New quiz
            </TriggerButton>
            <Popup open={open} closeOnDocumentClick onClose={closeModal} modal>
                <ModalBox>
                    <ModalClose onClick={closeModal} aria-label="Close">
                        <FaRegCircleXmark size={28}/>
                    </ModalClose>
                    <CreateQuizForm/>
                </ModalBox>
            </Popup>
        </>
    );
}
