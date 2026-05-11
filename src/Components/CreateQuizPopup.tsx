import {ReactNode, useState} from "react";
import CreateQuizForm from "./CreateQuizForm.tsx";
import Modal from "./Modal.tsx";
import {Button} from "../design";

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
                <Button type="button" $variant="primary" $size="xl" onClick={openModal}>
                    ＋ New quiz
                </Button>
            )}
            <Modal open={open} onClose={closeModal}>
                <CreateQuizForm/>
            </Modal>
        </>
    );
}
