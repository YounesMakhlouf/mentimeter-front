import {ReactNode} from 'react';
import Popup from 'reactjs-popup';
import {FaRegCircleXmark} from 'react-icons/fa6';
import styled from 'styled-components';

const ModalBox = styled.div`
    width: min(35rem, calc(100% - 2rem));
    background: var(--card);
    border: 2.5px solid var(--ink);
    border-radius: var(--r-xl);
    box-shadow: var(--shadow-xl);
    padding: 1.75rem 2rem 2rem;
    position: relative;
`;

const CloseBtn = styled.button`
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--ink);
    padding: 0.25rem;
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
                    <FaRegCircleXmark size={28}/>
                </CloseBtn>
                {children}
            </ModalBox>
        </Popup>
    );
}
