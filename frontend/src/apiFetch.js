import { useAuthStore, refreshOnce } from "./store/auth";

export const apiFetch = async (url, options = {}) => {
  const doFetch = (token) =>
    fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

  let res = await doFetch(useAuthStore.getState().accessToken);

  if (res.status === 401) {
    const data = await refreshOnce();
    if (data.success) {
      useAuthStore.getState().setAccessToken(data.accessToken);
      res = await doFetch(data.accessToken);
    } else {
      await useAuthStore.getState().logout();
    }
  }
  return res;
};