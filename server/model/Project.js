import mongoose from "mongoose";

const projectSchema = mongoose.Schema({
  name: { type: String },
  userId: { type: String, required: true },
  code: { type: String, default: "" },
  messages: [
    {
      text: { type: String },
      createdAt: { type: Date, default: Date.now() },
    },
  ],
});

export default mongoose.model("Project", projectSchema);
