import {ReactNode} from 'react';
import Popup from 'reactjs-popup';
import {FaRegCircleXmark} from 'react-icons/fa6';
import styled from 'styled-components';

const ModalBox = styled.div`
    width: min(35rem, calc(100vw - 2rem));
    background: var(--card);
    border: 2.5px solid var(--ink);
    border-radius: var(--r-xl);
    box-shadow: var(--shadow-xl);
    padding: 1.5rem 1.5rem 1.75rem;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    @media (min-width: 30em) {
        padding: 1.75rem 2rem 2rem;
        gap: 1.5rem;
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
    return (
        <Popup open={open} closeOnDocumentClick onClose={onClose} modal>
            <ModalBox>
                <CloseBtn onClick={onClose} aria-label="Close" type="button">
                    <FaRegCircleXmark size={24}/>
                </CloseBtn>
                {children}
            </ModalBox>
        </Popup>
    );
}
