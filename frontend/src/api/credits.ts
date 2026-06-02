import { API_URL } from "./config";

export async function simulateCreditRecharge(amount: number) {
  const response = await fetch(`${API_URL}/users/credits/simulate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
    body: JSON.stringify({ amount }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || "No se pudo actualizar el saldo");
  return data.result;
}
