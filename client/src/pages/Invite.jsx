import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

function Invite() {
  const { token } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(`/api/project/invite-project/${token}`)
      .then((res) => setProject(res.data))
      .catch((error) => setError(error.message)); // invalid or expired link
  }, [token]);

  const handleJoin = async () => {
    try {
      const res = await api.post(`/api/project/invite-join/${token}`);
      navigate(`/projects/${res.data.projectId}`);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-xl shadow-md text-center">
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <h2 className="text-xl mb-4">Join "{project?.projectName}" ?</h2>

            <button
              onClick={handleJoin}
              disabled={!project}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer disabled:opacity-50"
            >
              Accept & Join
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Invite;
