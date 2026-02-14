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

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

app.set("io", io);

socketHandler(io);

app.use(express.json());

connectDB();

app.use(cookieParser());

app.use("/api", userRoute);
app.use("/api/project", projectRoute);

server.listen(ENV.PORT || 5000, () => {
  console.log("Server running on the port", ENV.PORT);
});
