import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    projectId: { type: String, required: true },
    sender: { type: String },
    text: { type: String, required: true },
  },
  { timeStamp: true },
);

export default mongoose.model("Message", messageSchema);
