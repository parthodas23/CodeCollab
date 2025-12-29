import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    refreshToken: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
