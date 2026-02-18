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
import { debounce } from "lodash";

function Project() {
  const { projectId } = useParams();
  const [data, setData] = useState(null);
  const [chat, setChat] = useState([]);
  const [text, setText] = useState("");
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const [files, setFiles] = useState({
    "main.js": "console.log('Hello Wrold')",
  });
  const [activeFile, setActiveFile] = useState("main.js");

  const saveFileToDB = async (fileName, content) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/project/file/${projectId}`,
        {
          fileName,
          content,
        },
      );
    } catch (error) {
      console.log(error);
    }
  };

  const debounceRef = useRef(
    debounce((fileName, content) => saveFileToDB(fileName, content), 500),
  );

  useEffect(() => {
    if (!projectId) return;

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/project/files/${projectId}`)
      .then((res) => {
        const fileObject = {};
        res.data?.forEach((file) => {
          fileObject[file.name] = file.content;
        });

        setFiles(fileObject);

        if (res.data?.length > 0) {
          setActiveFile(res.data[0].name);
        }
      });
  }, [projectId]);

  useEffect(() => {
    socketRef.current = io(`${import.meta.env.VITE_API_URL}`, {
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
      setUserData(user);
    };

    fetchUserData();
  }, []);

  const createFile = () => {
    const fileName = prompt("Enter JavaScript file name:");
    if (!fileName) return;

    if (files[fileName]) {
      alert("File already Exists.");
      return;
    }

    setFiles({ ...files, [fileName]: "" });
  };

  const sendMessage = () => {
    if (!text.trim()) return;

    const userName = userData?.name;
    const userId = userData?._id;
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
      .get(`${import.meta.env.VITE_API_URL}/api/project/data/${projectId}`)
      .then((res) => setData(res.data));
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/project/messages/${projectId}`)
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
            <button
              onClick={createFile}
              className="mb-2 bg-blue-500 px-2 py-1 text-sm rounded cursor-pointer hover:bg-blue-600"
            >
              + New File
            </button>

            {Object.keys(files).map((fileName) => (
              <div
                key={fileName}
                onClick={() => setActiveFile(fileName)}
                className={`cursor-pointer py-1 px-2 rounded ${activeFile === fileName ? "bg-gray-400" : ""}`}
              >
                {fileName}
              </div>
            ))}
          </div>
        </div>

        {/* codeEditor */}
        <div className="flex flex-1 min-h-0">
          <CodeEditor
            code={files[activeFile] || ""}
            setCode={(newCode) => {
              setFiles((prev) => ({
                ...prev,
                [activeFile]: newCode,
              }));
              debounceRef.current(activeFile, newCode);
            }}
            fileName={activeFile}
          />
        </div>
      </div>
    </div>
  );
}

export default Project;
