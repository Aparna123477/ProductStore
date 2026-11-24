import { create } from "zustand";
import { apiFetch } from "../apiFetch.js";

const jsonOpts = (method, body) => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const SESSION_MSG = "Session expired, please login again";

export const useProductStore = create((set) => ({
  products: [],
  setProducts: (products) => set({ products }),

  fetchProducts: async () => {
    try {
      const res = await apiFetch("/api/products");
      if (!res.ok) {
        set({ products: [] });
        return;
      }
      const data = await res.json();
      set({ products: data.data || [] });
    } catch {
      set({ products: [] });
    }
  },

  createProduct: async (newProduct) => {
    if (!newProduct.name || !newProduct.image || !newProduct.price) {
      return { success: false, message: "Please fill in all fields." };
    }
    try {
      const res = await apiFetch("/api/products", jsonOpts("POST", newProduct));
      const data = await res.json();
      if (!data.success) return { success: false, message: data.message };
      set((state) => ({ products: [...state.products, data.data] }));
      return { success: true, message: "Product created successfully" };
    } catch {
      return { success: false, message: SESSION_MSG };
    }
  },

  deleteProduct: async (pid) => {
    try {
      const res = await apiFetch(`/api/products/${pid}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) return { success: false, message: data.message };
      set((state) => ({ products: state.products.filter((p) => p._id !== pid) }));
      return { success: true, message: data.message };
    } catch {
      return { success: false, message: SESSION_MSG };
    }
  },

  updateProduct: async (pid, updatedProduct) => {
    try {
      const res = await apiFetch(`/api/products/${pid}`, jsonOpts("PUT", updatedProduct));
      const data = await res.json();
      if (!data.success) return { success: false, message: data.message };
      set((state) => ({
        products: state.products.map((p) => (p._id === pid ? data.data : p)),
      }));
      return { success: true, message: data.message };
    } catch {
      return { success: false, message: SESSION_MSG };
    }
  },

  generateDescription: async ({ name, notes }) => {
    try {
      const res = await apiFetch(
        "/api/products/generate-description",
        jsonOpts("POST", { name, notes })
      );
      const data = await res.json();
      if (!data.success) return { success: false, message: data.message };
      return { success: true, description: data.description };
    } catch {
      return { success: false, message: SESSION_MSG };
    }
  },

  smartSearch: async (query) => {
    try {
      const res = await apiFetch("/api/products/smart-search", jsonOpts("POST", { query }));
      const data = await res.json();
      if (!data.success) return { success: false, message: data.message };
      set({ products: data.data });
      return { success: true, filters: data.filters };
    } catch {
      return { success: false, message: "Search failed, try again" };
    }
  },
  assistantChat: async (message, history) => {
  try {
    const res = await apiFetch("/api/products/assistant", jsonOpts("POST", { message, history }));
    const data = await res.json();
    if (!data.success) return { success: false, message: data.message };
    return { success: true, reply: data.reply, products: data.products };
  } catch {
    return { success: false, message: "Assistant unavailable, try again" };
  }
},
fetchProductById: async (pid) => {
  try {
    const res = await apiFetch(`/api/products/${pid}`);
    const data = await res.json();
    if (!data.success) return { success: false, message: data.message };
    return { success: true, product: data.data };
  } catch {
    return { success: false, message: "Could not load product" };
  }
},
fetchSimilar: async (pid) => {
  try {
    const res = await apiFetch(`/api/products/${pid}/similar`);
    const data = await res.json();
    if (!data.success) return [];
    return data.data;
  } catch {
    return [];
  }
},
}));