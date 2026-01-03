import express from "express";
import { ENV } from "./lib/ENV.js";
import { connectDB } from "./lib/connectDB.js";
import userRoute from "./routes/user.js";
import projectRoute from "./routes/project.js";
import cookieParser from "cookie-parser";
import cors from "cors";
const app = express();

app.use(express.json());

connectDB();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/api", userRoute);
app.use("/api/project", projectRoute);
app.listen(ENV.PORT || 5000, () => {
  console.log("Server running on the port", ENV.PORT);
});
