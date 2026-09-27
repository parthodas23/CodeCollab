import api from "./axios";

// throws with the server's message (e.g. "email already exists")
export const registerData = (name, email, password) =>
  api.post("/api/register", { name, email, password });
