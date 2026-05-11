/**
 * Design tokens — everything the design system exposes from the TypeScript side.
 * Color / spacing / radius / shadow tokens live as CSS variables in src/index.css;
 * the variables that need a TS-side counterpart (typed values, palettes, enums)
 * live here.
 */

// ─── Multiple-choice options (Kahoot-style quad) ────────────────────
export type ShapeKind = 'circle' | 'square' | 'triangle' | 'diamond';

export interface OptMeta {
    letter: 'A' | 'B' | 'C' | 'D';
    shape: ShapeKind;
    colorVar: string;
    inkVar: string;
}

export const OPT_META: OptMeta[] = [
    {letter: 'A', shape: 'circle', colorVar: 'var(--opt-a)', inkVar: 'var(--opt-a-ink)'},
    {letter: 'B', shape: 'square', colorVar: 'var(--opt-b)', inkVar: 'var(--opt-b-ink)'},
    {letter: 'C', shape: 'triangle', colorVar: 'var(--opt-c)', inkVar: 'var(--opt-c-ink)'},
    {letter: 'D', shape: 'diamond', colorVar: 'var(--opt-d)', inkVar: 'var(--opt-d-ink)'},
];

// ─── Avatars ────────────────────────────────────────────────────────
export const EMOJI_AVATARS = ['🦊', '🐼', '🦄', '🐙', '🐝', '🦖', '🐸', '🦉', '🐧', '🦁', '🐻', '🐢'];

const AVATAR_COLOR_PALETTE = [
    '#FF3D7F', '#2F6BFF', '#FFC93C', '#2BD9A1', '#6E3BFF',
    '#FF6A2C', '#1FA76A', '#E11D74', '#3BB7E0', '#9B5DE5',
];

/** Deterministic background color for an initials avatar. */
export function colorFor(name: string): string {
    let h = 0;
    for (const c of name || '?') h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return AVATAR_COLOR_PALETTE[h % AVATAR_COLOR_PALETTE.length];
}

// ─── Breakpoints (em-based, scale with user font-size) ──────────────
export const bp = {
    xs: '30em',       // ~480px
    sm: '37.5em',     // ~600px
    md: '43.75em',    // ~700px
    lg: '50em',       // ~800px
    xl: '56.25em',    // ~900px
    '2xl': '68.75em', // ~1100px
} as const;

// ─── Fluid type scale (mirrors --step-N CSS variables) ──────────────
export const text = {
    caption: 'var(--step--2)',
    small: 'var(--step--1)',
    body: 'var(--step-0)',
    lead: 'var(--step-1)',
    h4: 'var(--step-2)',
    h3: 'var(--step-3)',
    h2: 'var(--step-4)',
    h1: 'var(--step-5)',
} as const;
