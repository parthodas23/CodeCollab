import React from "react";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Dashboard = () => {
  const [data, setData] = useState("");
  const navigate = useNavigate();

  const getData = async () => {
    const token = localStorage.getItem("accessToken");

    try {
      const res = await axios.get("http://localhost:5000/api/", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setData(res.data);
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          const refreshRes = await axios.post(
            "http://localhost:5000/api/refresh",
            {},
            { withCredentials: true }
          );

          const newToken = refreshRes.data.accessToken;
          localStorage.setItem("accessToken", newToken);

          return getData();
        } catch (refreshError) {
          if (refreshError.response?.status === 401) {
            localStorage.removeItem("accessToken");
            navigate("/login");
          }
        }
      }
    }
  };
  useEffect(() => {
    getData();
  }, []);

  const [popup, setPopup] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const newProject = {
      id: Date.now(),
      name: projectName,
    };

    setProjects([...projects, newProject]);
    setProjectName("");
    setPopup(false);
  };

  return (
    <div className="relative min-h-screen">
      {popup && <div className="fixed inset-0 bg-black/60 z-40"></div>}
      <h1 className="mt-5 text-2xl text-center font-light">
        Wellcome {data.name}
      </h1>
      <div>
        <button
          onClick={() => setPopup(true)}
          className="border-2 border-gray-600 py-3 px-5 rounded-2xl bg-gray-300 ml-4 hover:bg-gray-400 cursor-pointer"
        >
          New Project
        </button>
        {projects.length > 0 && (
          <div className="mt-4 ml-4">
            <h1 className="text-xl font-semibold mb-3">Your Current Project</h1>
            {projects?.map((p) => (
              <div className=" flex flex-row gap-4">
                <p className="py-3 px-7 bg-slate-400 rounded-xl border-2 border-gray-500 text-slate-100 mb-4">{p.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-sm bg-slate-50 rounded-2xl p-6 flex flex-col gap-4 "
          >
            <h1 className="text-center text-xl text-green-400 ">
              Create New Project
            </h1>
            <label className="flex flex-col gap-3">
              Project Name
              <input
                className="outline-none border focus:ring-2 focus:ring-amber-500 px-4 py-2 rounded-2xl "
                type="text"
                placeholder="Project Name"
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </label>
            <div className="flex justify-center mt-3">
              <button type="submit" className="px-7 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 cursor-pointer">
                Create Now
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
