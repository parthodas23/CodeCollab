import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { registerData } from "../api/register";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    setError(null);
    e.preventDefault();

    try {
      await registerData(name, email, password);
      navigate("/login");
    } catch (error) {
      setError(error.message);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-2xl"
      >
        <h1 className="text-center text-xl font-semibold mb-3">
          CodeCollab Register
        </h1>
        <div className="flex flex-col gap-4 ">
          <label className="flex flex-col gap-4">
            Name
            <input
              type="text"
              className="w-full border focus:ring-2 focus:ring-green-400 outline-none  px-4 py-2  rounded-2xl"
              placeholder="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-4">
            Email
            <input
              type="email"
              placeholder="email address"
              className="w-full  border focus:ring-2 focus:ring-green-400 px-4 rounded-2xl py-2 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-4">
            Password
            <input
              type="password"
              className="w-full  border focus:ring-2 focus:ring-green-400 px-4 rounded-2xl py-2 outline-none"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>
        <div className="mt-3">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="text-sky-600 font-semibold">
              Login
            </Link>
          </p>
        </div>
        {error && (
          <div className="text-sm text-red-400 bg-red-50 border border-red-100 px-4 py-2.5 rounded-lg">
            {error}
          </div>
        )}
        <div className="flex justify-center mt-7">
          <button className="bg-cyan-600 px-7 py-2 text-white rounded-xl hover:bg-cyan-700 cursor-pointer">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default Register;
