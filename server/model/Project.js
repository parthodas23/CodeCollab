import mongoose from "mongoose";

const projectSchema = mongoose.Schema({
  name: { type: String },
  userId: { type: String, required: true },
  code: { type: String, default: "" },
});

export default mongoose.model("Project", projectSchema);
