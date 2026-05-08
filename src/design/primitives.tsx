import {CSSProperties, ReactNode, useMemo} from 'react';
import styled from 'styled-components';
import {colorFor} from './avatars.ts';
import {ShapeKind} from './tokens.ts';
import {buildConfetti, buildShapeField} from './decoration.ts';

export function Logo({size = 32, mono = false}: {size?: number; mono?: boolean}) {
    const ink = 'var(--ink)';
    const brand = mono ? ink : 'var(--brand)';
    return (
        <span style={{display: 'inline-flex', alignItems: 'center', gap: size * 0.32}}>
            <svg width={size * 1.15} height={size * 1.15} viewBox="0 0 40 40" aria-hidden>
                <rect x="3" y="3" width="34" height="34" rx="10" fill={brand} stroke={ink} strokeWidth="3"/>
                <path
                    d="M14 26 L14 14 L26 14 L26 26 Q26 28 24 28 L20 28 L20 32 L16 28 Q14 28 14 26 Z"
                    fill="var(--card)" stroke={ink} strokeWidth="2.5" strokeLinejoin="round"/>
                <circle cx="18" cy="20" r="1.6" fill={ink}/>
                <circle cx="22" cy="20" r="1.6" fill={ink}/>
            </svg>
            <span style={{
                fontSize: size * 0.95,
                lineHeight: 1,
                fontWeight: 800,
                letterSpacing: '-0.04em',
                fontFamily: 'var(--display)',
            }}>QuizUp</span>
        </span>
    );
}

export function ShapeIcon({kind, size = 28, color = 'currentColor'}: {kind: ShapeKind; size?: number; color?: string}) {
    const stroke = 'var(--ink)';
    const sw = Math.max(2, size / 12);
    const inner = {fill: color, stroke, strokeWidth: sw, strokeLinejoin: 'round' as const};
    switch (kind) {
        case 'circle':
            return <svg width={size} height={size} viewBox="0 0 40 40"><circle cx="20" cy="20" r="14" {...inner}/></svg>;
        case 'square':
            return <svg width={size} height={size} viewBox="0 0 40 40"><rect x="7" y="7" width="26" height="26" rx="3" {...inner}/></svg>;
        case 'triangle':
            return <svg width={size} height={size} viewBox="0 0 40 40"><path d="M20 6 L34 32 L6 32 Z" {...inner}/></svg>;
        case 'diamond':
            return <svg width={size} height={size} viewBox="0 0 40 40"><path d="M20 5 L35 20 L20 35 L5 20 Z" {...inner}/></svg>;
    }
}

const AvatarCircle = styled.div<{$size: number; $bg: string; $textColor: string}>`
    width: ${({$size}) => $size}px;
    height: ${({$size}) => $size}px;
    border-radius: 50%;
    border: 2.5px solid var(--line);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--display);
    font-weight: 800;
    font-size: ${({$size}) => $size * 0.42}px;
    background: ${({$bg}) => $bg};
    color: ${({$textColor}) => $textColor};
    flex: none;
`;

export function Avatar({name, size = 56, emoji}: {name?: string; size?: number; emoji?: string}) {
    const initials = (name || '?').trim().split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase();
    return (
        <AvatarCircle
            $size={size}
            $bg={emoji ? 'var(--card)' : colorFor(name || '?')}
            $textColor={emoji ? 'var(--ink)' : '#fff'}
        >
            {emoji || initials}
        </AvatarCircle>
    );
}

export function Sticker({children, color = 'var(--opt-c)', rotate = -6, size = 14}: {
    children: ReactNode;
    color?: string;
    rotate?: number;
    size?: number;
}) {
    return (
        <span style={{
            display: 'inline-block',
            background: color,
            border: '2.5px solid var(--ink)',
            boxShadow: 'var(--shadow-sm)',
            borderRadius: 999,
            padding: '6px 14px',
            transform: `rotate(${rotate}deg)`,
            fontWeight: 800,
            fontSize: size,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--ink)',
            fontFamily: 'var(--display)',
        }}>{children}</span>
    );
}

export function ShapeField({density = 18, opacity = 0.18, seed = 1}: {
    density?: number;
    opacity?: number;
    seed?: number;
}) {
    const items = useMemo(() => buildShapeField(density, seed), [density, seed]);
    return (
        <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', opacity}}>
            {items.map((it, i) => (
                <div key={i} style={{
                    position: 'absolute', left: `${it.x}%`, top: `${it.y}%`,
                    transform: `rotate(${it.rot}deg)`,
                    animation: `float-bg ${it.dur}s ease-in-out ${it.delay}s infinite`,
                }}>
                    <ShapeIcon kind={it.kind} size={it.size} color={it.color}/>
                </div>
            ))}
        </div>
    );
}

export function GameCode({code, size = 96}: {code: string; size?: number}) {
    const grouped = String(code).replace(/\s/g, '').replace(/(.{3})/g, '$1 ').trim();
    return (
        <div style={{
            fontFamily: 'var(--display)',
            fontVariantNumeric: 'tabular-nums',
            fontSize: size,
            lineHeight: 1,
            fontWeight: 800,
            letterSpacing: '0.04em',
            color: 'var(--ink)',
        }}>{grouped}</div>
    );
}

export function Confetti({count = 60}: {count?: number}) {
    const bits = useMemo(() => buildConfetti(count), [count]);
    return (
        <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden'}}>
            {bits.map((b, i) => (
                <span key={i} style={{
                    position: 'absolute', left: `${b.x}%`, top: '60%',
                    width: b.size, height: b.size * 0.55, background: b.col,
                    borderRadius: 2,
                    ['--tx' as string]: `${b.tx}px`,
                    ['--ty' as string]: `${b.ty}vh`,
                    ['--rot' as string]: `${b.rot}deg`,
                    animation: `confetti-fall ${b.dur}s cubic-bezier(.2,.7,.4,1) ${b.delay}s forwards`,
                } as CSSProperties}/>
            ))}
        </div>
    );
}
