import * as userService from "../services/userService.js";

export const getMe = async (req, res, next) => {
  try {
    const user = await userService.getCurrentUser(req.userId);
    // req.userId was attached by verifyToken middleware
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
