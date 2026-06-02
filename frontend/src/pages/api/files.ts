import { API_URL } from "./config";

export async function uploadFiles(files: File[]) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/users/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || data.error || "Error subiendo archivos");
  }

  return data;
}

export async function generateQR(file_group_id: string) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/users/generate-qr/${file_group_id}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || data.error || "Error generando QR");
  }

  return data;
}
