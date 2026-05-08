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
