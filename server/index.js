import express from "express";
import { ENV } from "./lib/ENV.js";
import { connectDB } from "./lib/connectDB.js";
import userRoute from "./routes/user.js";
import projectRoute from "./routes/project.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Server } from "socket.io";
import http from "node:http";
import socketHandler from "./socket/socketHandler.js";
const app = express();
const server = http.createServer(app);

app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173",
  "https://code-collab-delta-umber.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

connectDB();
app.use(cookieParser());

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://code-collab-delta-umber.vercel.app",
    ],
    credentials: true,
  },
});

app.set("io", io);

socketHandler(io);

app.use("/api", userRoute);
app.use("/api/project", projectRoute);
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
server.listen(ENV.PORT || 5000, () => {
  console.log("Server running on the port", ENV.PORT);
});
