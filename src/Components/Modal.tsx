import {ReactNode} from 'react';
import Popup from 'reactjs-popup';
import {FaRegCircleXmark} from 'react-icons/fa6';
import styled from 'styled-components';

const ModalBox = styled.div`
    width: min(560px, calc(100% - 32px));
    background: var(--card);
    border: 2.5px solid var(--ink);
    border-radius: var(--r-xl);
    box-shadow: var(--shadow-xl);
    padding: 28px 32px 32px;
    position: relative;
`;

const CloseBtn = styled.button`
    position: absolute;
    top: 16px;
    right: 16px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--ink);
    padding: 4px;
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
