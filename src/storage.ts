/**
 * Single source of truth for every key the app stores in the browser.
 */

/** localStorage keys — persist across tab close. */
export const local = {
    /** JWT, set after a successful login. Read by `getToken`. */
    token: 'token',
    /** `{email, username, accessToken}` — the login response body. */
    loginInfo: 'loginInfo',
    /** Participant's chosen display name from the join-quiz flow. */
    name: 'name',
} as const;

/** sessionStorage keys — wiped on tab close. */
export const session = {
    /** Host's lobby session code, set when navigating to /startquiz. */
    lobbyCode: 'startquiz:sessionCode',
    /** Participant's active quiz code, set when navigating to /qspage. */
    playerCode: 'qspage:quizCode',
    /** Final leaderboard payload, set when navigating to /leaderboard. */
    leaderboardPayload: 'leaderboard:payload',
} as const;

/**
 * Wipe every stored bit of user state — auth, identity, and any quiz-session
 * scratch space. Called on logout, 401 responses, and expired tokens.
 */
export const wipeStoredState = () => {
    for (const key of Object.values(local)) localStorage.removeItem(key);
    for (const key of Object.values(session)) sessionStorage.removeItem(key);
};
