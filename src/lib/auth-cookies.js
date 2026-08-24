const REFRESH_COOKIE_DEV = 'refreshToken';
const REFRESH_COOKIE_PROD = '__Host-refreshToken';

export function refreshCookieName() {
  return process.env.NODE_ENV === 'production' ? REFRESH_COOKIE_PROD : REFRESH_COOKIE_DEV;
}

export function setRefreshCookie(response, token, maxAge) {
  response.cookies.set(refreshCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge,
    path: '/',
  });
}

export function clearRefreshCookie(response) {
  response.cookies.set(refreshCookieName(), '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
}
