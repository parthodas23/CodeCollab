import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { IoSend } from "react-icons/io5";
import CodeEditor from "../components/CodeEditor";

function Project() {
  const { projectId } = useParams();
  const [data, setData] = useState(null);
  const [chat, setChat] = useState(null);
  const [text, setText] = useState("");

  const setMessages = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/project/messages",
        { projectId, text }
      );
      console.log(res.data);
      setChat(res.data);
      setText("");
    } catch (error) {
      console.log(error);
    }
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

  console.log(chat);
  return (
    <div className="h-screen flex flex-col">
      {/* header */}

      <div className="bg-gray-800 text-white flex items-center px-4 h-14">
        {data?.name}
      </div>

      {/* main */}
      {/* flex-1 take the rest of spaces */}
      <div className="flex-1 min-h-0 flex">
        {/* messages */}
        <div className="w-96 bg-gray-100 flex flex-col border-r">
          <div className="h-12 flex items-center border-b font-semibold px-4 ">
            Messages
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
            {chat?.messages.map((m) => (
              <div
                key={m._id}
                className="bg-white rounded-xl p-3 shadow wrap-break-word"
              >
                {m.text}
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
              onClick={() => setMessages()}
              className="text-3xl m-3 cursor-pointer hover:text-green-500"
            />
          </div>
        </div>

        {/* fileStructure */}
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
    // <div className="h-screen flex flex-col">

    //   <header className="h-14 bg-gray-800 text-white flex items-center px-4">
    //     {data?.name}
    //   </header>

    //   {/* MAIN AREA */}

    //   <div className="flex-1 min-h-0 flex">

    //     {/* MESSAGES PANEL */}

    //     <div className="w-96 bg-gray-100 border-r flex flex-col">
    //       {/* messages header */}
    //       <div className="h-12 border-b flex items-center px-3 font-semibold">
    //         Messages
    //       </div>

    //       {/* messages list (scrolls) */}
    //       <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
    //         {[...Array(50)].map((_, i) => (
    //           <div key={i} className="bg-white p-2 rounded shadow">
    //             Message {i + 1}
    //           </div>
    //         ))}
    //       </div>

    //       {/* input row */}
    //       <div className="h-14 border-t flex">
    //         <input
    //           className="flex-1 px-3 outline-none"
    //           placeholder="Type message..."
    //         />
    //         <button className="px-4 bg-blue-600 text-white">Send</button>
    //       </div>
    //     </div>

    //     {/* FILE PANEL */}
    //     <div className="w-64 bg-gray-200 border-r flex flex-col">
    //       <div className="h-12 border-b flex items-center px-3 font-semibold">
    //         Files
    //       </div>

    //       <div className="flex-1 min-h-0 overflow-y-auto p-3">
    //         {[...Array(60)].map((_, i) => (
    //           <div key={i} className="py-1">
    //             file_{i}.js
    //           </div>
    //         ))}
    //       </div>
    //     </div>

    //     {/* CODE EDITOR */}
    //     <div className="flex-1 min-h-0 flex">
    //       <CodeEditor />
    //     </div>
    //   </div>
    // </div>
  );
}

export default Project;
