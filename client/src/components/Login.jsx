import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/login",
        {
          email: email,
          password: password,
        },
        { withCredentials: true }
      );
      localStorage.setItem("accessToken", res.data.accessToken);
      alert("Login Successfull");
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="h-screen  flex justify-center items-center">
      <form
        onSubmit={onSubmit}
        className="h-[325px] w-[375px] bg-sky-300 text-center p-3"
      >
        <h1 className="font-semibold mt-7 text-xl">CodeCollab Login</h1>

        <div>
          <input
            type="text"
            placeholder="email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="outline-none border-b border-b-green-500 text-center px-2 py-2 mt-6"
          />
          <input
            type="password"
            placeholder="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="outline-none border-b border-b-green-500 text-center px-2 py-2 mt-6"
          />
        </div>
        <button className="px-10 py-1.5 bg-blue-500 text-white mt-10 rounded-2xl hover:bg-blue-600 cursor-pointer">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
