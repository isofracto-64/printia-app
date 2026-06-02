import { API_URL } from "./config";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

async function apiRequest(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "Error de servidor");
  return data.result ?? data;
}

export const listAdminUsers = (q = "") =>
  apiRequest(`/admin/users?q=${encodeURIComponent(q)}`);

export const updateAdminUser = (id: string, payload: Record<string, unknown>) =>
  apiRequest(`/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const deleteAdminUser = (username: string) =>
  apiRequest(`/admin/users/${encodeURIComponent(username)}`, {
    method: "DELETE",
  });

export const listTickets = () => apiRequest("/admin/tickets");

export const updateTicket = (id: string, payload: Record<string, unknown>) =>
  apiRequest(`/admin/tickets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const getKioskConfig = () => apiRequest("/admin/kiosk-config");

export const saveKioskConfig = (payload: Record<string, unknown>) =>
  apiRequest("/admin/kiosk-config", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
