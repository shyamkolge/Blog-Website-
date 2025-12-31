import api from "./axios";

// Login API
export const loginAPI = async (data) => {
  const response = await api.post("/v1/auth/login", data);
  return response.data;
};


// Signup API
export const signupAPI = async (data) => {
  const response = await api.post("/v1/auth/sign-up", data);
  return response.data;
};


// Get Me API
export const getMeApi = async () => {
  const res = await api.get("/v1/auth/me");
  return res.data;
};

// Logout API
export const logoutAPI = async () => {
  const response = await api.get("/v1/auth/log-out");
  return response.data;
};

