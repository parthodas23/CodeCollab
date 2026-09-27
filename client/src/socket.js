import { io } from "socket.io-client";
import { BASE_URL, refreshToken } from "./api/axios";

// the server only accepts sockets with a valid access token
export const createSocket = () => {
  const socket = io(BASE_URL, {
    withCredentials: true,
    auth: (cb) => cb({ token: localStorage.getItem("accessToken") }), // read on every (re)connect
  });

  // token expired: refresh it and connect again
  socket.on("connect_error", (err) => {
    if (err.message === "unauthorized") {
      refreshToken()
        .then(() => socket.connect())
        .catch(() => {}); // refresh failed -> already sent to /login
    }
  });

  return socket;
};
