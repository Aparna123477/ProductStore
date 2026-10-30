import { create } from "zustand";

const post = async (url, body) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
};

// ek time pe sirf ek refresh request chalegi (rotation ke liye zaroori)
let refreshPromise = null;

export const refreshOnce = () => {
  if (!refreshPromise) {
    refreshPromise = post("/api/auth/refresh").finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

export const useAuthStore = create((set) => ({
  accessToken: null,
  userName: localStorage.getItem("loggedInUser"),
  isAuthenticated: false,
  authChecked: false,

  signup: async (formData) => {
    const data = await post("/api/auth/signup", formData);
    return { success: data.success, message: data.message };
  },

  login: async (formData) => {
    const data = await post("/api/auth/login", formData);
    if (!data.success) return { success: false, message: data.message };

    localStorage.setItem("loggedInUser", data.name);
    set({
      accessToken: data.accessToken,
      userName: data.name,
      isAuthenticated: true,
    });
    return { success: true, message: data.message };
  },

  // app start / reload pe call hota hai
  initAuth: async () => {
    try {
      const data = await refreshOnce();
      if (data.success) {
        set({
          accessToken: data.accessToken,
          userName: data.name,
          isAuthenticated: true,
          authChecked: true,
        });
      } else {
        set({ accessToken: null, isAuthenticated: false, authChecked: true });
      }
    } catch (error) {
      set({ accessToken: null, isAuthenticated: false, authChecked: true });
    }
  },

  setAccessToken: (accessToken) => set({ accessToken }),

  logout: async () => {
    try {
      await post("/api/auth/logout");
    } catch (error) {
      // network fail ho to bhi local logout karo
    }
    localStorage.removeItem("loggedInUser");
    set({ accessToken: null, userName: null, isAuthenticated: false });
  },
}));