const getApiUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  if (typeof window !== "undefined" && window.location.hostname.endsWith("onrender.com")) {
    return "https://printia-api.onrender.com";
  }

  return "http://127.0.0.1:8000";
};

export const API_URL = getApiUrl();
