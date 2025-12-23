import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/register", {
        username,
        email,
        password,
      });
      navigate("/login");
    } catch (error) {
      console.log(error);
      return;
    }
  };
  return (
    <div className="h-screen flex items-center justify-center">
      <form
        onSubmit={onSubmit}
        className="h-[350px] w-[400px] bg-cyan-200 p-4 rounded-2xl shadow-2xl text-center"
      >
        <h1 className="text-center font-semibold">CodeCollab</h1>
        <div className="  gap-6 ">
          <input
            type="text"
            className="border-b text-center border-b-cyan-600 outline-none px-1 py-2 mt-5"
            placeholder="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="email"
            placeholder="email address"
            className="border-b text-center border-b-cyan-600 px-1 py-2 outline-none mt-5"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="border-b text-center border-b-cyan-600 px-1 py-2 outline-none  mt-5"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="bg-cyan-600 px-7 py-1 rounded-xl hover:bg-cyan-700 cursor-pointer  mt-7">
          Submit
        </button>
      </form>
    </div>
  );
}

export default Register;
