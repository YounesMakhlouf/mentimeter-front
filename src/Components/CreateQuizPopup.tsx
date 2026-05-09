import {ReactNode, useState} from "react";
import styled from "styled-components";
import CreateQuizForm from "./CreateQuizForm.tsx";
import Modal from "./Modal.tsx";
import {XLargeButton} from "../design/styled.ts";

const TriggerButton = styled(XLargeButton)`
    background: var(--brand);
    color: var(--brand-ink);
`;

interface Props {
    trigger?: (open: () => void) => ReactNode;
}

export default function CreateQuizPopup({trigger}: Props) {
    const [open, setOpen] = useState(false);
    const closeModal = () => setOpen(false);
    const openModal = () => setOpen(true);
    return (
        <>
            {trigger ? trigger(openModal) : (
                <TriggerButton type="button" onClick={openModal}>
                    ＋ New quiz
                </TriggerButton>
            )}
            <Modal open={open} onClose={closeModal}>
                <CreateQuizForm/>
            </Modal>
        </>
    );
}
