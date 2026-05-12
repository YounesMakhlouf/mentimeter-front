import styled, {css} from 'styled-components';

export type ButtonVariant = 'default' | 'primary' | 'ink' | 'ghost';
export type ButtonSize = 'md' | 'lg' | 'xl';

const sizeStyles = (size: ButtonSize) => {
    switch (size) {
        case 'lg':
            return css`
                padding: 1.125rem 1.75rem;
                font-size: var(--step-0);
                border-radius: var(--r-lg);
            `;
        case 'xl':
            return css`
                padding: 1.375rem 2.25rem;
                font-size: var(--step-1);
                border-radius: var(--r-lg);
                box-shadow: var(--shadow-lg);
            `;
        default:
            return null;
    }
};

const variantStyles = (variant: ButtonVariant) => {
    switch (variant) {
        case 'primary':
            return css`
                background: var(--brand);
                color: var(--brand-ink);
            `;
        case 'ink':
            return css`
                background: var(--ink);
                color: var(--paper);
            `;
        case 'ghost':
            return css`
                background: transparent;
                box-shadow: none;
                border-color: transparent;
                &:hover { background: rgba(0, 0, 0, .06); box-shadow: none; transform: none; }
            `;
        default:
            return null;
    }
};

export const Button = styled.button<{$variant?: ButtonVariant; $size?: ButtonSize}>`
    appearance: none;
    border: 2.5px solid var(--line);
    background: var(--card);
    color: var(--ink);
    border-radius: var(--r-md);
    padding: 0.875rem 1.375rem;
    font-weight: 700;
    font-size: var(--step--1);
    cursor: pointer;
    box-shadow: var(--shadow-md);
    transition: transform .12s ease, box-shadow .12s ease;
    font-family: var(--body);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--gap-3);
    white-space: nowrap;
    line-height: 1;

    &:hover { transform: translateY(-1px); box-shadow: var(--shadow-lg); }
    &:active { transform: translateY(2px); box-shadow: 0 2px 0 var(--ink); }
    &:disabled { cursor: not-allowed; opacity: 0.5; }

    ${({$size = 'md'}) => sizeStyles($size)}
    ${({$variant = 'default'}) => variantStyles($variant)}
`;

/** Full-page shell used by the public-facing routes. */
export const Page = styled.div`
    position: relative;
    min-height: 100vh;
    overflow-x: hidden;
    background: var(--paper);
`;

/**
 * Flex column with a gap from the --gap-N scale. Default $gap=4 (1rem).
 * Pass $gap as 2|3|4|5|6|8 to pick the corresponding --gap-N token.
 * Extend with `styled(Stack)` when more props are needed.
 */
export const Stack = styled.div<{$gap?: 2 | 3 | 4 | 5 | 6 | 8}>`
    display: flex;
    flex-direction: column;
    gap: var(--gap-${({$gap = 4}) => $gap});
`;

/** Flex row with a gap from the --gap-N scale. Default $gap=3 (0.75rem). */
export const Row = styled.div<{$gap?: 2 | 3 | 4 | 5 | 6 | 8}>`
    display: flex;
    gap: var(--gap-${({$gap = 3}) => $gap});
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
    font-size: var(--step-0);
    font-family: var(--body);
    width: 100%;
    box-shadow: inset 0 -3px 0 rgba(0, 0, 0, .06);
    outline: none;
    &:focus { box-shadow: var(--shadow-sm); }
    &::placeholder { color: var(--ink-mute); }
`;

export const ErrorText = styled.div`
    color: #bc2525;
    font-weight: 600;
    font-size: var(--step--1);
`;

export const Chip = styled.span`
    display: inline-flex;
    align-items: center;
    gap: var(--gap-2);
    padding: 0.375rem 0.75rem;
    border-radius: 999px;
    border: 2px solid var(--line);
    background: var(--card);
    font-weight: 600;
    font-size: var(--step--2);
    color: var(--ink);
`;
