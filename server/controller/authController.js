import bcrypt from "bcrypt";
import User from "../model/User.js";
import jwt from "jsonwebtoken";
import { ENV } from "../lib/ENV.js";

const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id }, ENV.ACCESS_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, ENV.REFRESH_SECRET, { expiresIn: "30d" });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExist = await User.findOne({ email });
    if (userExist)
      return res.status(400).json({ erros: "User already exist." });
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({ name, email, password: hashedPassword });
    res.status(200).json({ msg: "Registration successfull." });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(403).json({ err: "User couldn't found." });

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched)
      return res.status(403).json({ msg: "Your password is wrong." });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({ accessToken, user: { id: user._id, email: user.email } });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) return res.status(401).json("User doesn't exist.");

    jwt.verify(refreshToken, ENV.REFRESH_SECRET, (err, decodedUser) => {
      if (err) return res.status(501).json(err);

      const newAccessToken = generateAccessToken(user);

      res.status(200).json({ accessToken: newAccessToken });
    });
  } catch (error) {
    res.status(500).json(error);
  }
};
