import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  name: { type: String },
  content: { type: String, default: "" },
});

const projectSchema = new mongoose.Schema({
  name: { type: String },
  userId: { type: String, required: true }, // owner
  files: [fileSchema],
  members: [{ type: String }],
  inviteToken: String,
  inviteExpires: Date,
});

export default mongoose.model("Project", projectSchema);
