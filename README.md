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

- **REST API** at `http://localhost:3000` — auth + quizzes
- **Socket.IO** at `http://localhost:3001` — live quiz events

Override the REST base via `VITE_API_URL` in a `.env` file. The Socket.IO URL is set in `src/socket.ts`.

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
| `npm run build`      | `tsc && vite build` — type-check then bundle; any type error fails the build |
| `npm run preview`    | Preview the production build                                                |
| `npm run lint`       | ESLint with `--max-warnings 0`; any warning is a failure                    |
| `npm test`           | Vitest run                                                                  |
| `npm run test:watch` | Vitest in watch mode                                                        |
| `npm run seed`       | Populate a local backend with demo data                                     |

## Architecture (short)

- **Routing**: `src/App.tsx` defines all routes under `createBrowserRouter` + `<RouterProvider>`. `PrivateRoutes.tsx` is the only auth gate (checks JWT `exp` via `jwt-decode`).
- **Auth**: Token + `loginInfo` live in `localStorage`. Read via the `useAuth` hook in `src/hooks/useAuth.ts`. Authed REST calls go through `authFetch` in `src/api.ts`, which dispatches an `app:unauthorized` event on 401 (handled in `RootLayout`) to bounce to `/authentication`.
- **Sockets**: A single typed `Socket<ServerToClientEvents, ClientToServerEvents>` instance in `src/socket.ts`. The same socket multiplexes the host flow (`createQuizSession` → `QuizCreationSuccess` → `sendQuestion`) and the participant flow (`joinQuiz` → `playerJoined`/`errorMsg` → `question` → `getAnswer` → `endQuiz`).
- **Design system**: `src/design/` exports the styled primitives (`Button` with `$variant`/`$size`, `Card`, `Input`, `Chip`, `ErrorText`, `Stack`, `Row`, `Page`) and the JS-side primitives (`Logo`, `Avatar`, `Sticker`, `ShapeIcon`, `ShapeField`, `GameCode`, `Confetti`). Global tokens (palette, shadows, radii, `--gap-N` scale, Utopia fluid type scale `--step--2`…`--step-5`) live in `src/index.css`. Global layout utilities `.wrapper` (centered column, parameterizable via `--wrapper-max`) and `.flow` (vertical rhythm via `--flow-space`) live in the same file.

For deeper architecture notes (the per-flow socket choreography, the BuildQuiz state shape, the conventions around new components), see [`CLAUDE.md`](./CLAUDE.md).

## Project layout

```
src/
  App.tsx                 router definition
  api.ts                  authFetch + token helpers
  socket.ts               typed Socket.IO client + event maps
  loaders.ts              react-router loaders
  index.css               tokens, type scale, .wrapper/.flow
  reset.css               modern CSS reset
  design/                 design-system primitives + tokens
  hooks/useAuth.ts        canonical hook for the logged-in user
  Components/             routed views (Home, BuildQuiz) + leaf components
  pages/                  remaining routed views (WelcomePage, StartQuizPage, QuestionPage, LeaderboardPage)
  __tests__/              Vitest suites
  test/helpers.ts         small JWT builders for tests
scripts/seed.mjs          npm run seed
```

## Testing

```sh
npm test          # one-off run
npm run test:watch
```

Tests use Vitest + React Testing Library + jsdom. The socket is mocked per-suite with a small handlers map (see `EnterQuizCodeForm.test.tsx` for the pattern). 70 tests cover auth, the API client, route loaders, and every page that participates in the host or participant flow.
