import * as authService from "../services/authService.js";
import { REFRESH_COOKIE_OPTIONS } from "../lib/cookieConfig.js";

export const register = async (req, res, next) => {
  try {
    await authService.registerUser(req.body);
    res.status(201).json({ message: "Registration successful." });
  } catch (error) {
    next(error); // pass to the global error handler
  }
};

export const login = async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.loginUser(
      req.body,
    );

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(200).json({ accessToken, user });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { accessToken } = await authService.refreshAccessToken(
      req.cookies.refreshToken,
    );
    res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  }
};
