import axios from "axios";

export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// one axios instance for the whole app: adds the access token to every request
const api = axios.create({ baseURL: BASE_URL, withCredentials: true });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// gets a new access token with the refresh cookie (shared, so parallel 401s refresh only once)
let refreshing = null;
export const refreshToken = () => {
  if (!refreshing) {
    refreshing = axios
      .post(`${BASE_URL}/api/refresh`, {}, { withCredentials: true })
      .then((res) => localStorage.setItem("accessToken", res.data.accessToken))
      .catch((error) => {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        throw error;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
};

// on 401: refresh once and retry; also show the server's error message
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error;
    if (response?.status === 401 && !config.retried && config.url !== "/api/login") {
      config.retried = true;
      await refreshToken();
      return api(config);
    }
    error.message = response?.data?.message || error.message;
    return Promise.reject(error);
  },
);

export default api;
