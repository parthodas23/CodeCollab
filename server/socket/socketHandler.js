import Message from "../model/Message.js";

const socketioHandler = (io) => {
  io.on("connection", (socket) => {
    socket.on("join-project", (projectId) => {
      socket.join(projectId);
    });

    socket.on("send-message", async (projectId, userId, text) => {
      const newMessages = await Message.create({
        projectId,
        sender: userId,
        text,
      });

      io.to(projectId).emit("recive-message", newMessages);
    });
  });
};

export default socketioHandler;
