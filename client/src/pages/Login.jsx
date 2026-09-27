import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await api.post("/api/login", { email, password });
      localStorage.setItem("accessToken", res.data.accessToken);
      navigate(location.state?.from || "/", { replace: true }); // back to the invite link, if any
    } catch (error) {
      setError(error.message);
    }
  };
  return (
    <div className="min-h-screen flex justify-center items-center bg-slate-50">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white p-6 shadow-2xl rounded-2xl"
      >
        <h1 className="font-semibold mt-3 mb-3 text-xl text-center">
          CodeCollab Login
        </h1>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-4">
            Email
            <input
              type="email"
              placeholder="email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="outline-none w-full rounded-2xl py-2 border focus:ring-2 focus:ring-green-500 px-4"
            />
          </label>
          <label className="flex flex-col gap-4">
            Password
            <input
              type="password"
              placeholder="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="outline-none w-full rounded-2xl py-2 border focus:ring-2 focus:ring-green-500 px-4"
            />
          </label>
        </div>
        <div className="mt-3">
          <p>
            Don't have an account?{" "}
            <Link className="text-sky-400 font-semibold" to="/register">
              Register
            </Link>{" "}
          </p>
        </div>
        {error && (
          <div className="mt-3 text-sm text-red-400 bg-red-50 border border-red-100 px-4 py-2.5 rounded-lg">
            {error}
          </div>
        )}
        <div className="flex justify-center mt-7">
          <button className="px-10 py-1.5 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 cursor-pointer">
            Login
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
