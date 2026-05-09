import styled, {css} from 'styled-components';

const buttonBase = css`
    appearance: none;
    border: 2.5px solid var(--line);
    background: var(--card);
    color: var(--ink);
    border-radius: var(--r-md);
    padding: 0.875rem 1.375rem;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: var(--shadow-md);
    transition: transform .12s ease, box-shadow .12s ease;
    font-family: var(--body);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.625rem;
    white-space: nowrap;
    line-height: 1;

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
    padding: 1.125rem 1.75rem;
    font-size: 1.125rem;
    border-radius: var(--r-lg);
`;

export const XLargeButton = styled.button`
    ${buttonBase}
    padding: 1.375rem 2.25rem;
    font-size: 1.375rem;
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
    padding: 0.875rem 1.125rem;
    font-size: 1.0625rem;
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
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    border-radius: 999px;
    border: 2px solid var(--line);
    background: var(--card);
    font-weight: 600;
    font-size: 0.8125rem;
    color: var(--ink);
`;
