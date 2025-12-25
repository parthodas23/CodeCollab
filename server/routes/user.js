import { Router } from "express";

import { register, login, refresh } from "../controller/authController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import User from "../model/User.js";

const router = Router();

router.post("/register", register);

router.post("/login", login);

router.post("/refresh", refresh);

router.get("/home", verifyToken, async (req, res) => {
  const user = await User.findById(req.userId).select("-password");
  res.json(user);
});

export default router;
