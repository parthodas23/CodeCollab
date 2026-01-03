import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { IoSend } from "react-icons/io5";

function Project() {
  const { projectId } = useParams();
  const [data, setData] = useState(null);
  const [chat, setChat] = useState(null);
  const [text, setText] = useState(null);
  const setMessages = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/project/messages",
        { projectId, text }
      );
      console.log(res.data);
      setChat(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  console.log(chat);
  useEffect(() => {
    if (!projectId) return;
    axios
      .get(`http://localhost:5000/api/project/data/${projectId}`)
      .then((res) => setData(res.data));
  }, [projectId]);

  useEffect(() => {});

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="p-2 border-b bg-white">
        <h1 className="text-center text-2xl font-semibold">
          Project Name:{" "}
          <span className="text-green-500 font-extralight">{data?.name}</span>
        </h1>
      </header>
      <main className="flex-1 grid grid-cols-2 gap-4">
        <div className="bg-gray-300  grid grid-cols-3">
          <div className="bg-gray-400 p-1 col-span-2 flex flex-col h-full">
            <h1 className="text-xl text-center">Messages</h1>
            <div className="flex-1 overflow-y-auto bg-gray-300 rounded-xl p-2">
              <h1>Hi</h1>
              <h2>How are you?</h2>
            </div>
            <div className="flex mb-4 mt-2">
              <textarea
                type="text"
                placeholder="write messages"
                rows={1}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 outline-none py-4 px-4 bg-gray-500 text-white rounded-xl mr-3 resize-none"
              />
              <IoSend
                onClick={() => setMessages()}
                className="mt-2 text-3xl cursor-pointer"
              />
            </div>
          </div>
          <div className="bg-gray-700 p-2 col-span-1">
            <h1 className="text-xl text-white ml-2">{data?.name}</h1>
          </div>
        </div>
        <div className="bg-white">
          <p className="text-center">Run Code</p>
        </div>
      </main>
    </div>
  );
}

export default Project;
