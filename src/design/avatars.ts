export const EMOJI_AVATARS = ['🦊', '🐼', '🦄', '🐙', '🐝', '🦖', '🐸', '🦉', '🐧', '🦁', '🐻', '🐢'];

export const AVATAR_COLOR_PALETTE = [
    '#FF3D7F', '#2F6BFF', '#FFC93C', '#2BD9A1', '#6E3BFF',
    '#FF6A2C', '#1FA76A', '#E11D74', '#3BB7E0', '#9B5DE5',
];

export function colorFor(name: string): string {
    let h = 0;
    for (const c of name || '?') h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return AVATAR_COLOR_PALETTE[h % AVATAR_COLOR_PALETTE.length];
}
