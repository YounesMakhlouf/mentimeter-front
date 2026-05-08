import styled, {css} from 'styled-components';

const buttonBase = css`
    appearance: none;
    border: 2.5px solid var(--line);
    background: var(--card);
    color: var(--ink);
    border-radius: var(--r-md);
    padding: 14px 22px;
    font-weight: 700;
    font-size: 16px;
    cursor: pointer;
    box-shadow: var(--shadow-md);
    transition: transform .12s ease, box-shadow .12s ease;
    font-family: var(--body);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    &:hover { transform: translateY(-1px); box-shadow: var(--shadow-lg); }
    &:active { transform: translateY(2px); box-shadow: 0 2px 0 var(--ink); }
    &:disabled { cursor: not-allowed; }
`;

export const Button = styled.button`${buttonBase}`;

export const PrimaryButton = styled.button`
    ${buttonBase}
    background: var(--brand);
    color: var(--brand-ink);
`;

export const InkButton = styled.button`
    ${buttonBase}
    background: var(--ink);
    color: var(--paper);
`;

export const LargeButton = styled.button`
    ${buttonBase}
    padding: 18px 28px;
    font-size: 18px;
    border-radius: var(--r-lg);
`;

export const XLargeButton = styled.button`
    ${buttonBase}
    padding: 22px 36px;
    font-size: 22px;
    border-radius: var(--r-lg);
    box-shadow: var(--shadow-lg);
`;

export const GhostButton = styled.button`
    ${buttonBase}
    background: transparent;
    box-shadow: none;
    border-color: transparent;
    &:hover { background: rgba(0, 0, 0, .06); box-shadow: none; transform: none; }
`;

export const Card = styled.div`
    background: var(--card);
    border: 2.5px solid var(--line);
    border-radius: var(--r-lg);
    box-shadow: var(--shadow-md);
`;

export const Input = styled.input`
    appearance: none;
    border: 2.5px solid var(--line);
    background: var(--card);
    color: var(--ink);
    border-radius: var(--r-md);
    padding: 14px 18px;
    font-size: 17px;
    font-family: var(--body);
    width: 100%;
    box-shadow: inset 0 -3px 0 rgba(0, 0, 0, .06);
    outline: none;
    &:focus { box-shadow: var(--shadow-sm); }
    &::placeholder { color: var(--ink-mute); }
`;

export const Chip = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 999px;
    border: 2px solid var(--line);
    background: var(--card);
    font-weight: 600;
    font-size: 13px;
    color: var(--ink);
`;
