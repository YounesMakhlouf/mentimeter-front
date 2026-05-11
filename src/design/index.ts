/**
 * One-stop barrel for the design system. Consumers should `import { Button, Logo, OPT_META, … } from '@/design'`
 * instead of reaching into individual files.
 *
 * Why three files instead of one:
 * - tokens.ts holds data only (constants, types, palettes)
 * - styled.ts holds styled-components (constant exports of a non-component shape, kept separate so
 *   react-refresh/only-export-components stays quiet)
 * - primitives.tsx holds React components (function exports)
 */
export * from './tokens';
export * from './styled';
export * from './primitives';
