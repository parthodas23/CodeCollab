export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "none",
  secure: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
