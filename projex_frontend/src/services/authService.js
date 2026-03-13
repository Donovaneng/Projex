import api from "./api";

export const authService = {
  async login(data) {
    const response = await api.post("/login", data);
    return response.data;
  },

  async register(data) {
    const response = await api.post("/register", data);
    return response.data;
  },

  async logout() {
    const response = await api.post("/logout");
    return response.data;
  },
};