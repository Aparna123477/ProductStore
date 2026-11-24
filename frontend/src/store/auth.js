import { create } from "zustand";

const post = async (url, body) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  // 401 / 429 / 500 ko properly error throw karo taaki retry loop na chale
  if (!res.ok) {
    const error = new Error(data.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    throw error;
  }

  return data;
};

// ek time pe sirf ek refresh request chalegi (rotation ke liye zaroori)
let refreshPromise = null;
let refreshFailed = false;

export const refreshOnce = () => {
  // Agar refresh pehle hi fail ho chuka hai, to dubara server ko hit mat karo
  if (refreshFailed) {
    return Promise.reject(new Error("Session expired"));
  }

  if (!refreshPromise) {
    refreshPromise = post("/api/auth/refresh")
      .then((data) => {
        if (!data.success) {
          refreshFailed = true;
          throw new Error(data.message || "Refresh failed");
        }
        refreshFailed = false;
        return data;
      })
      .catch((err) => {
        refreshFailed = true;
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export const useAuthStore = create((set, get) => ({
  accessToken: null,
  userName: localStorage.getItem("loggedInUser"),
  isAuthenticated: false,
  authChecked: false,

  signup: async (formData) => {
    try {
      const data = await post("/api/auth/signup", formData);
      return { success: data.success, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  login: async (formData) => {
    try {
      const data = await post("/api/auth/login", formData);
      if (!data.success) return { success: false, message: data.message };

      refreshFailed = false; // Login ke baad refresh dubara enable karo
      localStorage.setItem("loggedInUser", data.name);
      set({
        accessToken: data.accessToken,
        userName: data.name,
        isAuthenticated: true,
        authChecked: true,
      });
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // app start / reload pe call hota hai
  initAuth: async () => {
    // Agar already check ho chuka hai ya chal raha hai to dubara mat chalao (StrictMode guard)
    if (get().authChecked) return;

    try {
      const data = await refreshOnce();
      localStorage.setItem("loggedInUser", data.name);
      set({
        accessToken: data.accessToken,
        userName: data.name,
        isAuthenticated: true,
        authChecked: true,
      });
    } catch (error) {
      localStorage.removeItem("loggedInUser");
      set({
        accessToken: null,
        userName: null,
        isAuthenticated: false,
        authChecked: true,
      });
    }
  },

  setAccessToken: (accessToken) => {
    if (accessToken) refreshFailed = false;
    set({ accessToken });
  },

  logout: async () => {
    // Sirf tabhi backend /logout hit karo jab user actually authenticated ho
    if (get().isAuthenticated) {
      try {
        await post("/api/auth/logout");
      } catch (error) {
        // network fail ho to bhi local logout karo
      }
    }
    refreshFailed = true;
    localStorage.removeItem("loggedInUser");
    set({ accessToken: null, userName: null, isAuthenticated: false });
  },
}));