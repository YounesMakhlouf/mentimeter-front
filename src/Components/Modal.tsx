import {ReactNode, useEffect, useRef} from 'react';
import styled from 'styled-components';
import {FaRegCircleXmark} from 'react-icons/fa6';
import {Stack} from '../design';

const Dialog = styled.dialog`
    width: min(35rem, calc(100vw - 2rem));
    border: 2.5px solid var(--ink);
    background: var(--card);
    color: var(--ink);
    padding: 0;
    border-radius: var(--r-xl);
    box-shadow: var(--shadow-xl);

    &::backdrop {
        background: rgba(0, 0, 0, 0.5);
    }
`;

const Box = styled(Stack)`
    position: relative;
    padding: 1.5rem 1.5rem 1.75rem;

    @media (min-width: 30em) {
        padding: 1.75rem 2rem 2rem;
        gap: var(--gap-5);
    }
`;

const CloseBtn = styled.button`
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--ink);
    padding: 0.25rem;
    line-height: 0;
`;

interface ModalProps {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
}

export default function Modal({open, onClose, children}: ModalProps) {
    const ref = useRef<HTMLDialogElement>(null);

    // Drive the dialog in lockstep with the prop.
    useEffect(() => {
        const dlg = ref.current;
        if (!dlg) return;
        if (open && !dlg.open) dlg.showModal();
        else if (!open && dlg.open) dlg.close();
    }, [open]);

    return (
        <Dialog
            ref={ref}
            onClose={onClose}
            onClick={(e) => { if (e.target === ref.current) onClose(); }}
        >
            {open && (
                <Box>
                    {children}
                    <CloseBtn onClick={onClose} aria-label="Close" type="button">
                        <FaRegCircleXmark size={24}/>
                    </CloseBtn>
                </Box>
            )}
        </Dialog>
    );
}
