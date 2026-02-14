import Message from "../model/Message.js";

const socketHandler = (io) => {
  io.on("connection", (socket) => {

    socket.on("join-project", (projectId) => {
      socket.join(projectId);

    });

    socket.emit("message", "Hello from backend.");

    socket.on("send-message", async ({ projectId, userName, userId, text }) => {
      const newMessage = await Message.create({
        projectId,
        userName,
        userId,
        text,
      });

      io.to(projectId).emit("recive-message", newMessage);
    });
  });
};

export default socketHandler;
