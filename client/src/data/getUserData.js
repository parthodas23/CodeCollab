import axios from "axios";

export const getUserData = async (navigate) => {
  const accessToken = localStorage.getItem("accessToken");

  try {
    const res = await axios.get("http://localhost:5000/api/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true,
    });

    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      try {
        const refreshRes = await axios.post(
          "http://localhost:5000/api/refresh",
          {},
          {
            withCredentials: true,
          },
        );

        const newAccessToken = refreshRes.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);

        return getUserData(navigate);
      } catch (refreshError) {
        if (refreshError.response?.status === 401) {
          localStorage.removeItem("accessToken");
          navigate("/login");
        }
      }
    }

    throw error;
  }
};
