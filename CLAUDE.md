# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server.
- `npm run build` — `tsc && vite build` (type-checks the whole project before bundling, so type errors fail the build even though `tsconfig.json` has `strict: false`).
- `npm run lint` — ESLint with `--max-warnings 0`; any warning is a failure.
- `npm run preview` — preview the production build.

There is no test runner configured.

## Backend dependencies (must be running locally)

The frontend is hard-coded against two local backends — nothing will work without them:

- **REST API at `http://localhost:3000`** — auth (`/authentication/login`, `/authentication/register`), quizzes (`POST /quizzes`, `GET /users/:email/quizzes`). URLs are inlined via `fetch(...)` in components, not centralized.
- **Socket.IO at `http://localhost:3001`** — see `src/socket.js`. In production the URL is `undefined` so the client connects to `window.location`.

## Architecture

### Routing and auth gate

`src/App.tsx` defines all routes under one `<BrowserRouter>`. `src/Components/PrivateRoutes.tsx` is the only auth gate: it checks `localStorage.getItem('loginInfo')` and either renders `<Outlet/>` or redirects to `/authentication`. There is no token refresh, no context, and no central auth store — every component that needs the user reads `localStorage` directly (`JSON.parse(localStorage.getItem('loginInfo'))`) and pulls `email` / `username` out. The participant's display name lives under a separate key, `localStorage.getItem('name')`.

Only `/home` and `/build` are gated. `/startquiz`, `/qspage`, and `/leaderboard` are public — they are reached via `navigate(..., { state })`, so refreshing those pages loses the state they depend on.

### Two user flows share the same socket

The socket module (`src/socket.js`) exports a single shared `socket` instance. Two separate flows multiplex over it:

1. **Quiz owner** — `Home` → `MainHomeBox` fetches the user's quizzes → `QuizBox.handleButtonClick` emits `createQuizSession` → server replies `QuizCreationSuccess` with a session code → navigate to `/startquiz` (`StartQuizPage`) which listens for `playerJoined` events and emits `sendQuestion` to begin.
2. **Quiz participant** — `WelcomePage` opens `EnterQuizCodeForm` modal → emits `joinQuiz` → server replies `playerJoined` (success) or `errorMsg` (failure). `WelcomePage` itself listens for the `question` event and navigates to `/qspage` when one arrives. `QuestionPage` then handles the per-question loop (`question` / `getAnswer`) and the `endQuiz` event, which navigates to `/leaderboard` with the participant payload.

Socket event names that cross the boundary: `joinQuiz`, `playerJoined`, `errorMsg`, `createQuizSession`, `QuizCreationSuccess`, `sendQuestion`, `question`, `getAnswer`, `endQuiz`. When changing event payloads, grep across both `pages/` and `Components/` — emitters and listeners are scattered.

### Quiz authoring shape

`BuildQuiz.tsx` keeps editor-only state (`options: string[]`, `validity: boolean[]`) and only on submit transforms it into the wire format the backend expects: `{ name, userEmail, code: null, topic, questions: [{ question, options: [{ label, isCorrect }], correctAnswer }] }`. The `correctAnswer` is derived as `options[validity.indexOf(true)]`, so the model assumes exactly one correct answer per question even though `validity` is an array.

### Conventions to be aware of

- `src/Components/` mixes routed views (e.g. `Home`, `BuildQuiz`) with leaf components. `src/pages/` only holds a few routed views. Don't assume the folder reflects the role.
- `src/socket.js` is plain JS; everything else is TS/TSX. TS config is loose (`strict: false`), and many event handlers/props are implicitly `any` — match the surrounding style rather than tightening types in passing.
- Styling is inconsistent: `styled-components` (`src/Components/Component.tsx` exports the auth-screen styled primitives), inline `CSSProperties` objects, per-component `<style>{styles}</style>` blocks (see `BuildQuiz.tsx`), and global CSS in `src/App.css` / `src/index.css`. New components typically inline a `CSSProperties` object near the top of the file.
- `EnterQuizCodeForm.tsx` reaches into the DOM with `document.querySelector('.successJoining' / '.errorJoining')` to toggle visibility from socket handlers. If you touch those class names, update both places.
