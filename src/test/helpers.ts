/**
 * Build a JWT-shaped string with the given payload. The signature is fake
 * (not validated by `jwt-decode`), so this is fine for testing decode-only paths.
 */
export const makeJwt = (payload: object): string => {
    const header = btoa(JSON.stringify({alg: 'HS256', typ: 'JWT'}));
    const body = btoa(JSON.stringify(payload));
    return `${header}.${body}.sig`;
};

/** Convenience: returns a JWT whose `exp` is `secondsAhead` seconds from now. */
export const futureJwt = (secondsAhead = 3600) =>
    makeJwt({exp: Math.floor(Date.now() / 1000) + secondsAhead});

/** Convenience: returns a JWT whose `exp` is in the past. */
export const expiredJwt = (secondsBehind = 60) =>
    makeJwt({exp: Math.floor(Date.now() / 1000) - secondsBehind});
