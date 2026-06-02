import { API_URL } from "../api/config";

export async function getFullHistory() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/users/history/full`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Error cargando historial");

  return res.json();
}
