import toast from "react-hot-toast";
import { create } from "zustand";
import axios from "../lib/axios";
import Toast from "../components/toast/Toast";

// eslint-disable-next-line no-unused-vars
export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  signup: async ({ name, email, password, confirmPassword }) => {
    set({ loading: true });

    if (password !== confirmPassword) {
      set({ loading: false });
      toast.error("Passwords do not match");
    }

    try {
      const promiseFunction = axios.post("/auth/signup", {
        name,
        email,
        password,
      });

      const res = await promiseFunction;

      Toast({
        promiseFunction,
        title: "Registration successful",
        errorMessage: res.data?.message,
      });

      set({ user: res.data, loading: false });
    } catch (error) {
      set({ loading: false });

      const errorMessage = error.response?.data?.message;
      toast.error(errorMessage);
    }
  },
  login: async (email, password) => {
    set({ loading: true });

    try {
      const promiseFunction = axios.post("/auth/login", {
        email,
        password,
      });

      const res = await promiseFunction;

      Toast({
        promiseFunction,
        title: "Login is successful",
        errorMessage: res.data?.message,
      });

      set({ user: res.data, loading: false });
    } catch (error) {
      set({ loading: false });

      const errorMessage = error.response?.data?.message;
      toast.error(errorMessage);
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const response = await axios.get("/auth/profile");
      set({ user: response.data, checkingAuth: false });
    } catch (error) {
      set({ checkingAuth: false, user: null });
      console.log(error.response.data.message);
    }
  },
}));
