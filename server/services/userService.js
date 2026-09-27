import User from "../model/User.js";

export const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).select("-password -refreshToken");

  if (!user) {
    throw { status: 404, message: "User not found." };
  }

  return user;
};