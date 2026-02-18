import React from "react";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { getUserData } from "../data/getUserData";
import { IoPersonAdd } from "react-icons/io5";

const Dashboard = () => {
  const [data, setData] = useState("");
  const navigate = useNavigate();
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const userId = data?._id;
  const [popup, setPopup] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");
  let [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = await getUserData(navigate);
      setData(user);
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/project/create`, {
      name: projectName,
      userId,
    });

    setProjects([...projects, res.data]);
    setProjectName("");
    setPopup(false);
  };

  useEffect(() => {
    if (!userId) return;
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/project/all/${userId}`)
      .then((res) => setProjects(res.data));
  }, [userId]);

  return (
    <div className="relative min-h-screen bg-slate-50 px-6 py-8">
      {/* Overlay */}
      {popup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"></div>
      )}

      {/* Header */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-10">
        <h1 className="text-3xl font-semibold text-slate-800">
          Welcome, <span className="text-indigo-600">{data?.name}</span>
        </h1>

        <button
          onClick={() => setPopup(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-indigo-700 transition duration-200"
        >
          + New Project
        </button>
      </div>

      {/* Projects Section */}
      {projects.length > 0 && (
        <section className="max-w-4xl mx-auto">
          <h2 className="text-lg font-medium text-slate-600 mb-4">
            Your Projects
          </h2>

          <div className="grid sm:grid-cols-2 gap-5">
            {projects.map((project) => (
              <Link
                to={`/projects/${project._id}`}
                key={project._id}
                className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-md hover:shadow-lg transition duration-200 group"
              >
                <span className="text-lg font-medium text-slate-700 group-hover:text-indigo-600 transition">
                  {project.name}
                </span>

                <IoPersonAdd
                  onClick={async (e) => {
                    e.preventDefault(); // stop link navigation
                    e.stopPropagation(); // stop bubbling

                    try {
                      const res = await axios.post(
                        `${import.meta.env.VITE_API_URL}/api/project/invite-link/${project._id}`,
                        { userId },
                      );

                      setInviteLink(res.data.inviteLink);
                      setInviteModal(true);
                    } catch (error) {
                      alert("Failed to generate invite link.");
                      console.log(error);
                    }
                  }}
                  className="cursor-pointer text-xl text-slate-400 hover:text-indigo-600 transition"
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {inviteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-xl">
            <h2 className="text-xl font-smibold text-slate-800 mb-4 ">
              Invite Member
            </h2>
            <div className="flex items-center gap-2 bg-slate-100 p-3 rounded-2xl">
              <input
                readOnly
                type="text"
                value={inviteLink}
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <button
                className="bg-indigo-600 text-white py-2 px-4 rounded-xl cursor-pointer hover:bg-indigo-700 transition"
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink);
                  setCopied(true);
                  setTimeout(() => {
                    setCopied(false);
                  }, 2000);
                }}
              >
                {copied ? "Copied" : "Copy Link"}
              </button>
            </div>

            <p className="text-sm text-slate-500 mt-3">
              Copy this link and share with your friend.
            </p>

            <div className="flex justify-end mt-2">
              <button
                className="px-4 py-2 text-slate-600 hover:text-slate-700"
                onClick={() => setInviteModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col gap-5 animate-fadeIn"
          >
            <h2 className="text-2xl font-semibold text-center text-slate-800">
              Create New Project
            </h2>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-slate-600">Project Name</label>
              <input
                type="text"
                placeholder="Enter project name..."
                required
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setPopup(false)}
                className="px-5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
