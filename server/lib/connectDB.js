import mongoose from "mongoose";
import { ENV } from "./ENV.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(ENV.DB_URL);
    console.log("DB is now connected");
  } catch (error) {
    console.log(error);
  }
};
