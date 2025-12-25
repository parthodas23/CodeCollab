import jwt from "jsonwebtoken";
import { ENV } from "../lib/ENV.js";

// this for backend protected route
export const verifyToken = (req, res, next) => {
  try {
    let authHeader = req.headers.authorization;
    if (!authHeader) return res.sendStatus(401);

    const token = authHeader.split(" ")[1];
    jwt.verify(token, ENV.ACCESS_SECRET, (err, decoded) => {
      if (err) return res.sendStatus(401);

      req.userId = decoded.id;
      next();
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};
