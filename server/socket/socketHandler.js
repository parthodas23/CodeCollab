import * as Y from "yjs";
import Message from "../model/Message.js";
import User from "../model/User.js";
import { verifyAccessToken } from "../lib/token.js";
import { getProjectData } from "../services/projectService.js";
import { joinDoc, leaveDoc } from "../services/collabService.js";

// wraps a handler so a bad event can never crash the server;
// if the client passed an ack callback it gets the result or { error }
const handle =
  (fn) =>
  async (...args) => {
    const ack = typeof args.at(-1) === "function" ? args.pop() : null;
    try {
      const result = await fn(...args);
      ack?.(result);
    } catch (err) {
      console.log("Socket error:", err.message);
      ack?.({ error: err.message || "Something went wrong" });
    }
  };

const socketHandler = (io) => {
  // only logged-in users can connect
  io.use(async (socket, next) => {
    try {
      const { id } = verifyAccessToken(socket.handshake.auth.token);
      const user = await User.findById(id).select("name");
      socket.data.user = { id, name: user.name };
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const { user } = socket.data;
    let room = null; // { projectId, doc, clientId } after join-project

    // join: check membership, then send chat history + the Yjs state the client is missing
    socket.on(
      "join-project",
      handle(async ({ projectId, clientId, sv }) => {
        const project = await getProjectData(projectId, user.id);
        const messages = await Message.find({ projectId }).sort({ createdAt: 1 });
        const doc = await joinDoc(projectId);
        room = { projectId, doc, clientId };
        socket.join(projectId);
        io.to(projectId).emit("awareness:query"); // everyone re-sends cursor + name
        return {
          name: project.name,
          me: user,
          messages: messages.map((m) => m.toJSON({ flattenObjectIds: true })), // plain objects (packet has binary)
          update: Y.encodeStateAsUpdate(doc, new Uint8Array(sv)),
          sv: Y.encodeStateVector(doc), // client replies with what the server is missing
        };
      }),
    );

    // CRDT update: merge into the server copy (saved to DB) and pass it on
    socket.on(
      "yjs:update",
      handle((update) => {
        if (!room) return;
        Y.applyUpdate(room.doc, new Uint8Array(update));
        socket.to(room.projectId).emit("yjs:update", update);
      }),
    );

    // awareness = cursors, selections, names, colors (only relayed, never saved)
    socket.on("awareness", (update) => {
      if (room) socket.to(room.projectId).emit("awareness", update);
    });

    socket.on(
      "send-message",
      handle(async (text) => {
        const newMessage = await Message.create({
          projectId: room.projectId,
          userName: user.name,
          userId: user.id,
          text: text.trim(),
        });

        io.to(room.projectId).emit("receive-message", newMessage);
      }),
    );

    // the client waits for this ack before disconnecting, so its last edits are never dropped
    socket.on("leave", handle(() => {}));

    socket.on("disconnect", () => {
      if (!room) return;
      socket.to(room.projectId).emit("awareness:remove", room.clientId);
      leaveDoc(room.projectId, room.doc);
    });
  });
};

export default socketHandler;
