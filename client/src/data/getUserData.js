import api from "../api/axios";

// token refresh / redirect to login is handled by the axios interceptor
export const getUserData = async () => {
  const res = await api.get("/api/user");
  return res.data;
};
