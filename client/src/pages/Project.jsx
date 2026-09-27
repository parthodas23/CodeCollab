import React, { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { Link, useParams } from "react-router-dom";
import { IoArrowBack, IoSend } from "react-icons/io5";
import CodeEditor from "../components/CodeEditor";
import { useProjectRoom } from "../collab";

function Project() {
  const { projectId } = useParams();
  const { room, name, files, users, messages, online, error } = useProjectRoom(projectId);
  const [text, setText] = useState("");
  const [activeFile, setActiveFile] = useState(null);
  const chatEndRef = useRef(null);

  const currentFile = files.includes(activeFile) ? activeFile : files[0];
  const ytext = room?.doc.getMap("files").get(currentFile);

  // let the others see which file we are in
  useEffect(() => {
    room?.awareness.setLocalStateField("file", currentFile);
  }, [room, currentFile]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const createFile = () => {
    const fileName = prompt("Enter JavaScript file name:")?.trim();
    if (!fileName) return;

    const fileMap = room.doc.getMap("files");
    if (fileMap.has(fileName)) {
      alert("File already Exists.");
      return;
    }

    fileMap.set(fileName, new Y.Text()); // shows up for everyone instantly
    setActiveFile(fileName);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    room.socket.emit("send-message", text);
    setText("");
  };

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-3 bg-slate-50">
        <p className="text-red-500">{error}</p>
        <Link to="/" className="text-indigo-600 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-gray-800 text-white flex items-center gap-3 px-4 h-14">
        <Link to="/" className="text-gray-400 hover:text-white" title="Dashboard">
          <IoArrowBack />
        </Link>
        {name}
        <span
          title={online ? "Connected" : "Offline, changes will sync when you reconnect"}
          className={`w-2 h-2 rounded-full ${online ? "bg-green-500" : "bg-gray-500"}`}
        />

        {/* who is online (same colors as their cursors) */}
        <div className="ml-auto flex -space-x-2">
          {users.map((u) => (
            <span
              key={u.id}
              title={`${u.name}${u.self ? " (you)" : ""} - ${u.file || ""}`}
              style={{ backgroundColor: u.color }}
              className="w-8 h-8 rounded-full border-2 border-gray-800 flex items-center justify-center text-sm font-semibold text-gray-900"
            >
              {u.name[0].toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {/* flex-1 take the rest of spaces */}
      <div className="flex-1 min-h-0 flex">
        {/* messages */}
        <div className="w-96 bg-gray-100 flex flex-col border-r">
          <div className="h-12 flex items-center border-b font-semibold px-4 ">
            Messages
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
            {messages.map((m) => (
              <div
                key={m._id}
                className="bg-white rounded-xl p-3 shadow break-words"
              >
                <p className="text-sm text-gray-600 font-semibold">
                  {m.userName}
                </p>

                <p className="mt-1 text-gray-800">{m.text}</p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={sendMessage} className="h-14 border-t flex">
            <input
              className="flex-1 outline-none px-3"
              type="text"
              placeholder="write messages...."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              type="submit"
              disabled={!room}
              className="text-3xl m-3 cursor-pointer hover:text-green-500"
            >
              <IoSend />
            </button>
          </form>
        </div>

        <div className="w-64 bg-gray-200 flex flex-col border-r">
          <p className="h-12 px-3 font-semibold border-b flex items-center">
            Files
          </p>
          <div className="flex-1 min-h-0 overflow-y-auto p-3">
            <button
              onClick={createFile}
              disabled={!room}
              className="mb-2 bg-blue-500 text-white px-2 py-1 text-sm rounded cursor-pointer hover:bg-blue-600"
            >
              + New File
            </button>

            {files.map((fileName) => (
              <div
                key={fileName}
                onClick={() => setActiveFile(fileName)}
                className={`cursor-pointer py-1 px-2 rounded flex items-center justify-between ${currentFile === fileName ? "bg-gray-400" : ""}`}
              >
                {fileName}
                {/* dots = other people in this file */}
                <span className="flex gap-1">
                  {users
                    .filter((u) => !u.self && u.file === fileName)
                    .map((u) => (
                      <span
                        key={u.id}
                        title={u.name}
                        style={{ backgroundColor: u.color }}
                        className="w-2 h-2 rounded-full"
                      />
                    ))}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* codeEditor */}
        <div className="flex flex-1 min-h-0">
          {ytext ? (
            <CodeEditor
              key={currentFile}
              ytext={ytext}
              awareness={room.awareness}
              fileName={currentFile}
            />
          ) : (
            <div className="flex-1 bg-[#2d2d2d] text-gray-400 flex items-center justify-center">
              Connecting...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Project;
