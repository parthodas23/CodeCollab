import { Router } from "express";
import User from "../model/User.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const data = new User(req.body);
    const savedData = await data.save();
    res.status(200).json(savedData);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const data = await User.findOne({username, password});
    if (data) {
      res.status(200).json(data);
    }

    return res.status(500).json("Something went wrong");
  } catch (error) {
    res.status(500).json(error);
  }
});

export default router;
