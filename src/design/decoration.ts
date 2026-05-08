import type {ShapeKind} from './tokens.ts';

interface FieldItem {
    x: number;
    y: number;
    size: number;
    kind: ShapeKind;
    color: string;
    rot: number;
    delay: number;
    dur: number;
}

interface ConfettiBit {
    x: number;
    tx: number;
    ty: number;
    rot: number;
    col: string;
    size: number;
    dur: number;
    delay: number;
}

const KINDS: ShapeKind[] = ['circle', 'square', 'triangle', 'diamond'];
const FIELD_COLORS = ['var(--opt-a)', 'var(--opt-b)', 'var(--opt-c)', 'var(--opt-d)'];
const CONFETTI_COLORS = ['var(--opt-a)', 'var(--opt-b)', 'var(--opt-c)', 'var(--opt-d)', 'var(--brand)'];

function makeRng(seed: number) {
    const state = {s: seed * 9301};
    return () => ((state.s = (state.s * 9301 + 49297) % 233280) / 233280);
}

export function buildShapeField(density: number, seed: number): FieldItem[] {
    const rng = makeRng(seed || 1);
    const out: FieldItem[] = [];
    for (let i = 0; i < density; i++) {
        out.push({
            x: rng() * 100,
            y: rng() * 100,
            size: 18 + rng() * 70,
            kind: KINDS[Math.floor(rng() * 4)],
            color: FIELD_COLORS[Math.floor(rng() * 4)],
            rot: rng() * 360,
            delay: rng() * 4,
            dur: 6 + rng() * 8,
        });
    }
    return out;
}

export function buildConfetti(count: number): ConfettiBit[] {
    const rng = makeRng(count * 7919 + 1);
    const out: ConfettiBit[] = [];
    for (let i = 0; i < count; i++) {
        out.push({
            x: 50 + (rng() - 0.5) * 40,
            tx: (rng() - 0.5) * 180,
            ty: -50 - rng() * 60,
            rot: rng() * 720 - 360,
            col: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            size: 6 + rng() * 10,
            dur: 1.4 + rng() * 1.6,
            delay: rng() * 0.5,
        });
    }
    return out;
}
