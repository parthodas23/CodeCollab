import axios from "axios";

export const getUserData = async (navigate) => {
  const accessToken = localStorage.getItem("accessToken");

  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/user`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      withCredentials: true,
    });

    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      try {
        const refreshRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/refresh`,
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
