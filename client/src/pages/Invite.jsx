import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { getUserData } from "../data/getUserData";
function Invite() {
  const { token } = useParams();
  const [project, setProject] = useState(null);
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const userId = data?._id;

  useEffect(() => {
    const fetchUserData = async () => {
      const user = await getUserData(navigate);
      setData(user);
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(
        `http://localhost:5000/api/project/invite-project/${token}`,
      );
      console.log(res);

      setProject(res.data);
    };

    fetchData();
  }, []);
  console.log(project);

  const handleJoin = async () => {
    await axios.post(
      `http://localhost:5000/api/project/invite-join/${token}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      },
    );

    window.location.href = `http://localhost:5173/projects/${project.projectId}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-xl mb-4">Join "{project?.projectName}" ?</h2>

        <button
          onClick={handleJoin}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer"
        >
          Accept & Join
        </button>
      </div>
    </div>
  );
}

export default Invite;
