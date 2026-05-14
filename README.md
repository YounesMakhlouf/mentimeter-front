# Real-time quiz frontend

A Kahoot-style classroom quiz tool. Teachers host a game from their dashboard, students join with a 6-digit PIN, and questions advance in real time over Socket.IO.

Stack: React 19, react-router 7, Vite 8, TypeScript (strict), styled-components 6, Socket.IO client, Vitest + React Testing Library.

## Quick start

```sh
git clone https://github.com/YounesMakhlouf/mentimeter-front.git
cd mentimeter-front
npm install
npm run dev
```

The app expects two local backends to be running:

- **REST API** at `http://localhost:3000` — auth (`/authentication/login`, `/authentication/register`) and quizzes (`POST /quizzes`, `GET /users/:email/quizzes`, `PATCH /quizzes/:id`, `DELETE /quizzes/:id`). Base URL via `VITE_API_URL`; all authed calls go through `authFetch` in `src/api.ts`, which injects the Bearer token and dispatches an `app:unauthorized` event on 401 (handled in `RootLayout` to bounce to `/authentication`).
- **Socket.IO** at `http://localhost:3001` — live quiz events. URL set in `src/socket.ts`.

To seed a local backend with a demo user and a handful of quizzes:

```sh
npm run seed
# customize the target:
API_URL=http://localhost:3000 EMAIL=demo@quizup.test PASSWORD=Demo123! npm run seed
```

## Scripts

| Command              | What it does                                                                |
| -------------------- | --------------------------------------------------------------------------- |
| `npm run dev`        | Vite dev server                                                             |
| `npm run build`      | `tsc && vite build` — any type error fails the build                        |
| `npm run preview`    | Preview the production build                                                |
| `npm run lint`       | ESLint with `--max-warnings 0`; any warning is a failure                    |
| `npm test`           | Vitest run                                                                  |
| `npm run test:watch` | Vitest in watch mode                                                        |
| `npm run seed`       | Populate a local backend with demo data                                     |

## Architecture

### Routing and auth gate

`src/App.tsx` defines all routes under `createBrowserRouter` + `<RouterProvider>`. `src/Components/PrivateRoutes.tsx` is the only auth gate: it checks `isTokenValid()` (JWT `exp` claim via `jwt-decode`) and either renders `<Outlet/>` or clears auth and redirects to `/authentication`.

Only `/home` and `/build` are gated. `/startquiz`, `/present`, `/qspage`, and `/leaderboard` are public — they're reached via `navigate(..., { state })`, so refreshing those pages loses the state they depend on (the pages fall back to `sessionStorage` keys like `startquiz:sessionCode`).

The `useAuth` hook in `src/hooks/useAuth.ts` is the canonical way to read the logged-in user's `email` / `username`. All browser-storage keys are declared in `src/storage.ts` (`local` / `session` maps); `clearAuth` iterates over them, so adding a new key auto-wipes on logout.

### Two user flows share the same socket

`src/socket.ts` exports a single typed `Socket<ServerToClientEvents, ClientToServerEvents>` instance plus a `reauthSocket()` helper that reconnects with the latest JWT.

1. **Quiz owner**: `Home` → `MainHomeBox` loads the user's quizzes → `QuizBox.handleStart` emits `createQuizSession` → server replies `QuizCreationSuccess` with a session code → navigate to `/startquiz` (`StartQuizPage`, the lobby) which listens for `playerJoined`. Clicking Start navigates to `/present` (`PresenterPage`), which emits the first `sendQuestion` after subscribing, and listens for `question` (the host is in the room too), `answerReceived` (host-only stream of player picks — the FE tallies the bar chart from it), and `endQuiz` (→ `/leaderboard`). Clicking Skip / Next emits the next `sendQuestion`.
2. **Quiz participant**: `WelcomePage` opens `EnterQuizCodeForm` → emits `joinQuiz` → server replies `playerJoined` (success) or `errorMsg` (failure). `WelcomePage` listens for `question` and navigates to `/qspage` when one arrives (seeding the first question via `location.state` since `WelcomePage` consumed it). `QuestionPage` handles the per-question loop (`question` / `getAnswer`), the `endQuiz` event (→ `/leaderboard`), and `sessionEnded` (host disconnected → bail to `/`).

Cross-boundary event names: `joinQuiz`, `playerJoined`, `errorMsg`, `createQuizSession`, `QuizCreationSuccess`, `sendQuestion`, `question`, `getAnswer`, `answerReceived`, `endQuiz`, `sessionEnded`. `answerReceived` is host-only; `sessionEnded` is room-wide.

When changing event payloads, update the typed event maps in `src/socket.ts` first — the typed `Socket<…>` makes the change land on every emitter and listener at once.

### Quiz authoring shape

`BuildQuiz.tsx` keeps editor state as `QuestionDraft[]` (`{text, options: string[], correctIndex: number | null}`) and on submit transforms it into the wire format the backend expects: `{ name, code: null, topic, questions: [{ question, options: [{ label, isCorrect }], correctAnswer }] }`. `correctAnswer` is the option string at `q.correctIndex`; the model assumes exactly one correct answer per question.

## Conventions

- **TypeScript is strict** (`strict: true`, `noUnusedLocals`, `noUnusedParameters`). The socket layer is typed end-to-end — prefer the `ServerToClientEvents` / `ClientToServerEvents` maps over re-typing payloads inline.
- **Styling is centralized in `src/design/`**, re-exported from `src/design/index.ts`. The design system exposes `Button` (`$variant`/`$size`), `Card`, `Input`, `Chip`, `ErrorText`, `Stack` (flex column) / `Row` (flex row) (both take `$gap` as a `--gap-N` token number), `Page`, plus the JS-side primitives (`Logo`, `Avatar`, `Sticker`, `ShapeIcon`, `ShapeField`, `GameCode`, `Confetti`). Global tokens (palette, shadows, radii, `--gap-N` scale 1–8, Utopia fluid type scale `--step--2`…`--step-5`) live in `src/index.css`; `src/reset.css` is imported before `index.css` in `src/main.tsx`. New components use styled-components; reserve inline `style={{}}` for genuinely dynamic per-instance values.
- **Global layout utilities**: `.wrapper` (responsive centered column, parameterizable via `--wrapper-max`) and `.flow` (vertical rhythm via `--flow-space`). Use `.wrapper` for the outermost layer per page; do not nest it.
- **Modals**: `src/components/Modal.tsx` is a thin wrapper around the native `<dialog>` with `showModal()`. Browser-managed focus trap, return-focus to the trigger, ESC close, `role="dialog"` / `aria-modal="true"`, and `::backdrop` overlay come for free. The content box extends `Stack` so children get vertical rhythm; the X close button is rendered last in DOM so initial focus lands on body content.
- **Folder split**: `src/pages/` holds every routed view (the element of a `<Route>`). `src/components/` holds everything else — leaves like `QuizBox`, route infrastructure like `RootLayout`/`PrivateRoutes`/`ErrorBoundary`, and shared widgets like `Modal` and `ReconnectingBanner`.

## Project layout

```
src/
  App.tsx                 router definition
  api.ts                  authFetch + token helpers
  socket.ts               typed Socket.IO client + event maps
  storage.ts              centralized localStorage / sessionStorage keys
  loaders.ts              react-router loaders
  index.css               tokens, type scale, .wrapper / .flow
  reset.css               modern CSS reset
  design/                 design-system primitives + tokens
  hooks/useAuth.ts        canonical hook for the logged-in user
  pages/                  every routed view (Welcome, Home, BuildQuiz, Authentication, Logout, StartQuiz, Present, Question, Leaderboard)
  components/             leaves + route infrastructure (RootLayout, PrivateRoutes, ErrorBoundary, Modal, …)
  __tests__/              Vitest suites
  test/helpers.ts         small JWT builders for tests
scripts/seed.mjs          npm run seed
```

## Testing

```sh
npm test          # one-off run
npm run test:watch
```

Vitest + React Testing Library + jsdom. The socket is mocked per-suite with a small handlers map — see `EnterQuizCodeForm.test.tsx` for the pattern. The current suite covers auth, the API client, route loaders, the modal, and every page that participates in the host or participant flow.
