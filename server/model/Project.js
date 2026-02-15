import mongoose from "mongoose";

const projectSchema = mongoose.Schema({
  name: { type: String },
  userId: { type: String, required: true }, // owner
  code: { type: String, default: "" },
  members: [{ type: String }],
  inviteToken: String,
  inviteExpires: Date,
});

export default mongoose.model("Project", projectSchema);
