import { useEffect, useState } from "react";
import * as Y from "yjs";
import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
  removeAwarenessStates,
} from "y-protocols/awareness";
import { createSocket } from "./socket";

// same user -> same color everywhere. Ids end with a counter, so users get neighbouring
// colors, which are ordered to look very different (red, green, fuchsia, orange, ...)
const COLORS = ["#f87171", "#4ade80", "#e879f9", "#fb923c", "#22d3ee", "#f472b6", "#facc15", "#818cf8"];
const colorOf = (userId) => COLORS[parseInt(userId.slice(-6), 16) % COLORS.length];

/**
 * Joins a project over one Socket.io connection:
 * - doc: Y.Doc with every file as a Y.Text (CRDT, so concurrent edits merge without conflicts)
 * - awareness: live cursors, selections, names and colors of everyone in the project
 * - chat messages
 */
export function useProjectRoom(projectId) {
  const [state, setState] = useState({ files: [], users: [], messages: [] });

  useEffect(() => {
    const doc = new Y.Doc();
    const awareness = new Awareness(doc);
    const socket = createSocket();
    const room = { doc, awareness, socket };
    const set = (patch) => setState((s) => ({ ...s, ...patch }));

    // file list + online users (skip the re-render when nothing visible changed)
    const refresh = () =>
      setState((s) => {
        const files = [...doc.getMap("files").keys()].sort();
        const users = [...awareness.getStates()]
          .filter(([, st]) => st.user)
          .map(([id, st]) => ({ id, self: id === doc.clientID, file: st.file, ...st.user }));
        const same = JSON.stringify([files, users]) === JSON.stringify([s.files, s.users]);
        return same ? s : { ...s, files, users };
      });

    // on every (re)connect: exchange state vectors so both sides get exactly what they miss
    socket.on("connect", () => {
      const sv = Y.encodeStateVector(doc);
      socket.emit("join-project", { projectId, clientId: doc.clientID, sv }, (res) => {
        if (res.error) return set({ error: res.error });
        Y.applyUpdate(doc, new Uint8Array(res.update), "remote");
        socket.emit("yjs:update", Y.encodeStateAsUpdate(doc, new Uint8Array(res.sv))); // offline edits
        const color = colorOf(res.me.id);
        awareness.setLocalStateField("user", { name: res.me.name, color, colorLight: color + "33" });
        set({ room, name: res.name, messages: res.messages, online: true });
        refresh();
      });
    });
    socket.on("disconnect", () => {
      const others = [...awareness.getStates().keys()].filter((id) => id !== doc.clientID);
      removeAwarenessStates(awareness, others, "remote");
      set({ online: false });
    });

    socket.on("yjs:update", (update) => Y.applyUpdate(doc, new Uint8Array(update), "remote"));
    socket.on("awareness", (update) => applyAwarenessUpdate(awareness, new Uint8Array(update), "remote"));
    socket.on("awareness:query", () => awareness.setLocalState(awareness.getLocalState()));
    socket.on("awareness:remove", (id) => removeAwarenessStates(awareness, [id], "remote"));
    socket.on("receive-message", (m) => setState((s) => ({ ...s, messages: [...s.messages, m] })));

    // send only our own changes (while offline they are sent on reconnect instead)
    doc.on("update", (update, origin) => {
      if (origin !== "remote" && socket.connected) socket.emit("yjs:update", update);
    });
    awareness.on("update", (_, origin) => {
      if (origin === "local" && socket.connected) {
        socket.emit("awareness", encodeAwarenessUpdate(awareness, [doc.clientID]));
      }
    });
    doc.getMap("files").observe(refresh);
    awareness.on("change", refresh);

    return () => {
      awareness.destroy(); // tells the others we left
      socket.off();
      // disconnect after the server has handled everything we sent (the last keystrokes too)
      socket.timeout(3000).emit("leave", () => socket.disconnect());
      doc.destroy();
    };
  }, [projectId]);

  return state;
}
