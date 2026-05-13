import {ReactNode, useEffect, useRef} from 'react';
import {FaRegCircleXmark} from 'react-icons/fa6';
import styled from 'styled-components';
import {Stack} from '../design';

/**
 * Native <dialog>. The browser handles all the things we'd otherwise have to
 * fight a library for: focus trap, Escape to close, return-focus to the
 * trigger, role="dialog" + aria-modal="true" implicitly via showModal(), and
 * the backdrop layer via ::backdrop. We only own the visuals.
 */
const Dialog = styled.dialog`
    /* Reset UA defaults so the dialog box itself stays transparent —
       ModalBox below paints the actual card. */
    border: none;
    background: transparent;
    padding: 0;
    color: inherit;
    max-width: none;
    max-height: none;
    /* Native default leaves a stale closed dialog visible as an empty box on
       some engines — make sure it's gone when not open. */
    &:not([open]) { display: none; }

    &::backdrop {
        background: rgba(27, 14, 43, .5);
    }
`;

const ModalBox = styled(Stack)`
    width: min(35rem, calc(100vw - 2rem));
    background: var(--card);
    border: 2.5px solid var(--ink);
    border-radius: var(--r-xl);
    box-shadow: var(--shadow-xl);
    padding: 1.5rem 1.5rem 1.75rem;
    position: relative;

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
    const dialogRef = useRef<HTMLDialogElement>(null);

    // Drive the native dialog imperatively from the `open` prop. showModal()
    // is what unlocks the focus trap, Escape handling, and the ::backdrop —
    // setting the `open` attribute manually doesn't do any of that.
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) {
            dialog.showModal();
        } else if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    // Clicks on the ::backdrop bubble up to the <dialog> element itself —
    // descendants (i.e. the ModalBox subtree) have different targets, so the
    // equality check filters them out cleanly.
    const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
        if (e.target === dialogRef.current) onClose();
    };

    return (
        <Dialog ref={dialogRef} onClose={onClose} onClick={handleClick}>
            {/* Mount the subtree only while open so form components re-init
                on each open (the previous reactjs-popup wrapper unmounted
                the children too) and so queries from outside the modal
                aren't ambiguous with hidden ::before-open content. */}
            {open && (
                <ModalBox>
                    {children}
                    <CloseBtn onClick={onClose} aria-label="Close" type="button">
                        <FaRegCircleXmark size={24} aria-hidden="true"/>
                    </CloseBtn>
                </ModalBox>
            )}
        </Dialog>
    );
}
