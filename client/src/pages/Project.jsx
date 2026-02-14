import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IoSend } from "react-icons/io5";
import CodeEditor from "../components/CodeEditor";
import { io } from "socket.io-client";
import { getUserData } from "../data/getUserData";
import { useRef } from "react";

function Project() {
  const { projectId } = useParams();
  const [data, setData] = useState(null);
  const [chat, setChat] = useState([]);
  const [text, setText] = useState("");
  const navigate = useNavigate();

  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:5000", {
      withCredentials: true,
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!projectId) return;
    socketRef.current.emit("join-project", projectId);
  }, [projectId]);

  useEffect(() => {
    socketRef.current.on("recive-message", (newMessage) => {
      setChat((prev) => [...prev, newMessage]);
    });

    return () => {
      socketRef.current.off("recive-message");
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = await getUserData(navigate);
      setData(user);
    };

    fetchUserData();
  }, []);

  const sendMessage = () => {
    if (!text.trim()) return;

    const userName = data?.name;
    const userId = data?._id;
    socketRef.current.emit("send-message", {
      projectId,
      userName,
      userId,
      text,
    });
    setText("");
  };

  useEffect(() => {
    if (!projectId) return;
    axios
      .get(`http://localhost:5000/api/project/data/${projectId}`)
      .then((res) => setData(res.data));
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    axios
      .get(`http://localhost:5000/api/project/messages/${projectId}`)
      .then((res) => setChat(res.data));
  }, [projectId]);

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-gray-800 text-white flex items-center px-4 h-14">
        {data?.name}
      </div>

      {/* flex-1 take the rest of spaces */}
      <div className="flex-1 min-h-0 flex">
        {/* messages */}
        <div className="w-96 bg-gray-100 flex flex-col border-r">
          <div className="h-12 flex items-center border-b font-semibold px-4 ">
            Messages
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
            {chat?.map((m) => (
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
          </div>

          <div className="h-14 border-t flex">
            <input
              className="flex-1 outline-none px-3"
              type="text"
              placeholder="write messages...."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <IoSend
              onClick={() => sendMessage()}
              className="text-3xl m-3 cursor-pointer hover:text-green-500"
            />
          </div>
        </div>

        <div className="w-64 bg-gray-200 flex flex-col border-r">
          <p className="h-12 px-3 font-semibold border-b flex items-center">
            Files
          </p>
          <div className="flex-1 min-h-0 overflow-y-auto p-3">
            {[...Array(60)].map((_, i) => (
              <div className="py-1" key={i}>
                file_{i}.js
              </div>
            ))}
          </div>
        </div>

        {/* codeEditor */}
        <div className="flex flex-1 min-h-0">
          <CodeEditor />
        </div>
      </div>
    </div>
  );
}

export default Project;
