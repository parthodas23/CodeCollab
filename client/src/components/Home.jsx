import React from "react";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Home = () => {
  const [data, setData] = useState("");
  const navigate = useNavigate();

  const getData = async () => {
    const token = localStorage.getItem("accessToken");

    try {
      const res = await axios.get("http://localhost:5000/api/home", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setData(res.data);
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          const refreshRes = await axios.get(
            "http://localhost:5000/api/refresh",
            {},
            { withCredentials: true }
          );

          const newToken = refreshRes.data.accessToken;
          localStorage.setItem("accessToken", newToken);
        } catch (error) {
          localStorage.removeItem("accessToken");
          navigate("/");
        }
      }
    }
  };
  useEffect(() => {
    getData();
  }, []);

  console.log(data);
  return (
    <div className="max-h-0 m-0 p-0">
      <h1 className="text-center m-10 font-bold text-xl">This is home page</h1>
      <div className="h-87.5 w-full bg-cyan-600">
        <h2 className="text-center font-semibold mt-4 text-emerald-700">
          All data would be appear in here
        </h2>
      </div>
    </div>
  );
};

export default Home;
