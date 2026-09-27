import jwt from "jsonwebtoken";
import { ENV } from "./ENV.js";

export const generateAccessToken = (userId) =>
  jwt.sign({ id: userId }, ENV.ACCESS_SECRET, { expiresIn: "15m" });

export const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, ENV.REFRESH_SECRET, { expiresIn: "30d" });

export const verifyRefreshToken = (token) =>
  jwt.verify(token, ENV.REFRESH_SECRET);

export const verifyAccessToken = (token) =>
  jwt.verify(token, ENV.ACCESS_SECRET);
