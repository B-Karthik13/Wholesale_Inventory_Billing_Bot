import { create } from "zustand";
import api from "../api/axiosInstance.js";

export const useAuth = create((set, get) => ({
  currentUser: null,
  token: localStorage.getItem("token"),
  loading: true,

  //restore session on app load
  loadUser: async () => {
    const token = get().token;
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const res = await api.get("/auth/me");
      set({ currentUser: res.data.data.user, loading: false });
    } catch {
      localStorage.removeItem("token");
      set({ token: null, currentUser: null, loading: false });
    }
  },

  login: async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token: newToken, user: newUser } = res.data.data;
    localStorage.setItem("token", newToken);
    set({ token: newToken, currentUser: newUser });
    return newUser;
  },

  register: async (data) => {
    await api.post("/auth/register", data);
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, currentUser: null });
  },

  updateUser: (updatedUser) => {
    set({ currentUser: updatedUser });
  }
}));
