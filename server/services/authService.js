import bcrypt from "bcrypt";
import User from "../model/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../lib/token.js";

export const registerUser = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw { status: 400, message: "Name, email and password are required." };
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw {
      status: 409,
      message: "An account with this email already exists.",
    }; // 409 - conflicts
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hashedPassword });
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw { status: 400, message: "Email and password are required." };
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw { status: 401, message: "Invalid email or password" };
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw { status: 401, message: "Invalid email or password" };
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken; // persist refreshToken in DB so we can use it later
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: { id: user._id, email: user.email },
  };
};

export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw { status: 401, message: "No refresh token provided." };
  }

  const user = await User.findOne({ refreshToken });
  if (!user) {
    throw { status: 401, message: "Invalid refresh token." };
  }

  try {
    verifyRefreshToken(refreshToken);
  } catch {
    throw { status: 403, message: "Refresh token expired or tampered." };
    // 403 - forbidden
  }

  return { accessToken: generateAccessToken(user._id) };
};
