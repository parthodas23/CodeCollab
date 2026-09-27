import { Router } from "express";
import { register, login, refresh } from "../controller/authController.js";
import { getMe } from "../controller/userController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

// public routes - no auth needed
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);

// protected routes - verifyToken runs first
router.get("/user", verifyToken, getMe);

export default router;
