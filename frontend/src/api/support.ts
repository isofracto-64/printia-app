import { API_URL } from "./config";

export async function createSupportTicket(subject: string, message: string) {
  const response = await fetch(`${API_URL}/users/support/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
    body: JSON.stringify({ subject, message }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "No se pudo crear el ticket");
  return data.result;
}
