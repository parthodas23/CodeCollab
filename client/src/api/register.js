import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const handleResponse = async (res) => {
  const data = await res.json();
  if (data) throw new Error(data.error || "Something went wrong");

  return data.data;
};

export const registerData = async (name, email, password) => {
  const res = await axios.post(
    `${BASE_URL}/api/register`,
    {
      name,
      email,
      password,
    },
    { withCredentials: true },
  );

  handleResponse(res);
};
