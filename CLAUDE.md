# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server.
- `npm run build` — `tsc && vite build` (type-checks the whole project before bundling, so any type error fails the build; `tsconfig.json` has `strict: true`).
- `npm run lint` — ESLint with `--max-warnings 0`; any warning is a failure.
- `npm run preview` — preview the production build.
- `npm test` — Vitest run; `npm run test:watch` for watch mode.
- `npm run seed` — populates the local backend with a demo user (`demo@quizup.test` / `Demo123!`) and a handful of quizzes. Honors `API_URL`, `EMAIL`, `PASSWORD` env vars. Quizzes are appended each run; don't reseed in a loop.

## Backend dependencies (must be running locally)

The frontend is hard-coded against two local backends — nothing will work without them:

- **REST API at `http://localhost:3000`** — auth (`/authentication/login`, `/authentication/register`) and quizzes (`POST /quizzes`, `GET /users/:email/quizzes`, `PATCH /quizzes/:id`, `DELETE /quizzes/:id`). The base URL comes from `VITE_API_URL`; all authed calls go through `authFetch` in `src/api.ts`, which injects the Bearer token and dispatches an `app:unauthorized` event on 401 (handled by `RootLayout` to bounce the user to `/authentication`).
- **Socket.IO at `http://localhost:3001`** — see `src/socket.ts`. In production the URL is `undefined` so the client connects to `window.location`.

## Architecture

### Routing and auth gate

`src/App.tsx` defines all routes under `createBrowserRouter` + `<RouterProvider>`. `src/Components/PrivateRoutes.tsx` is the only auth gate: it checks `isTokenValid()` (JWT `exp` claim via `jwt-decode`) and either renders `<Outlet/>` or clears auth and redirects to `/authentication`. The `useAuth` hook in `src/hooks/useAuth.ts` is the canonical way to read the logged-in user's `email` / `username`; it returns a `{email, username, token, isAuthenticated}` shape. The participant's display name (set during the join-quiz flow) lives under a separate key, `localStorage.getItem('name')`.

Only `/home` and `/build` are gated. `/startquiz`, `/present`, `/qspage`, and `/leaderboard` are public — they are reached via `navigate(..., { state })`, so refreshing those pages loses the state they depend on (the pages fall back to `sessionStorage` keys like `startquiz:sessionCode`, `present:sessionCode`, `qspage:quizCode`).

### Two user flows share the same socket

The socket module (`src/socket.ts`) exports a single typed `Socket<ServerToClientEvents, ClientToServerEvents>` instance plus a `reauthSocket()` helper that reconnects with the latest JWT. Two separate flows multiplex over it:

1. **Quiz owner** — `Home` → `MainHomeBox` loads the user's quizzes via the home loader → `QuizBox.handleStart` emits `createQuizSession` → server replies `QuizCreationSuccess` with a session code → navigate to `/startquiz` (`StartQuizPage`, the lobby) which listens for `playerJoined` events. Clicking Start emits `sendQuestion` and navigates to `/present` (`PresenterPage`), the big-screen view that listens for `question` (the host is in the room too), `answerReceived` (a host-only stream of player picks — the FE tallies the bar chart from it), and `endQuiz` (→ navigate to `/leaderboard`). Clicking Skip / Next emits the next `sendQuestion`.
2. **Quiz participant** — `WelcomePage` opens `EnterQuizCodeForm` modal → emits `joinQuiz` → server replies `playerJoined` (success) or `errorMsg` (failure), and the form switches between `name` / `avatar` / `submitting` / `joined` states locally. `WelcomePage` itself listens for the `question` event and navigates to `/qspage` when one arrives (seeding the first question via `location.state` since `WelcomePage` consumed it). `QuestionPage` then handles the per-question loop (`question` / `getAnswer`) and the `endQuiz` event, which navigates to `/leaderboard` with the participant payload.

Socket event names that cross the boundary: `joinQuiz`, `playerJoined`, `errorMsg`, `createQuizSession`, `QuizCreationSuccess`, `sendQuestion`, `question`, `getAnswer`, `answerReceived`, `endQuiz`. `answerReceived` is host-only — players don't subscribe. When changing event payloads, update the typed event maps in `src/socket.ts` first — `Socket<ServerToClientEvents, ClientToServerEvents>` makes the change land on every emitter and listener at once.

### Quiz authoring shape

`BuildQuiz.tsx` keeps editor-only state as `QuestionDraft[]` (`{text, options: string[], correctIndex: number | null}`) and only on submit transforms it into the wire format the backend expects: `{ name, code: null, topic, questions: [{ question, options: [{ label, isCorrect }], correctAnswer }] }`. `correctAnswer` is the option string at `q.correctIndex`; the model assumes exactly one correct answer per question.

### Conventions to be aware of

- `src/Components/` mixes routed views (e.g. `Home`, `BuildQuiz`) with leaf components. `src/pages/` only holds a few routed views. Don't assume the folder reflects the role.
- TypeScript is strict (`strict: true`, `noUnusedLocals`, `noUnusedParameters`). The socket layer (`src/socket.ts`) exports typed `ServerToClientEvents` / `ClientToServerEvents` maps; prefer those over re-typing event payloads inline.
- Styling is centralized in `src/design/` (tokens, styled primitives, decoration helpers — re-exported from `src/design/index.ts`). The design system exposes `Button` (`$variant`/`$size`), `Card`, `Input`, `Chip`, `ErrorText`, `Stack` (flex column) / `Row` (flex row) (both take `$gap` as a `--gap-N` token number), `Page`, plus the `Logo` / `Avatar` / `Sticker` / `ShapeIcon` / `ShapeField` / `GameCode` / `Confetti` primitives. Global tokens (palette, shadows, radii, `--gap-N` scale 1–8, Utopia fluid type scale `--step--2`…`--step-5`) live in `src/index.css`; `src/reset.css` holds the modern CSS reset and is imported before `index.css` in `src/main.tsx`. New components use styled-components; reserve inline `style={{}}` for genuinely dynamic per-instance values (e.g. animation delays computed in JS).
- Global layout utilities: `.wrapper` (responsive centered column, parameterizable via `--wrapper-max`) and `.flow` (vertical rhythm using `> * + * { margin-top }`, parameterizable via `--flow-space`). Use `.wrapper` for the outermost layer per page; do not nest it.
- Modals use `src/Components/Modal.tsx` (wraps `reactjs-popup`). The library's CSS is not imported; centering relies on the inline `display: flex` + content `margin: auto` it ships. `ModalBox` extends `Stack`, so children automatically get the right vertical rhythm.
