import { API_URL } from "./config";
interface LoginData {
  username: string;
  password: string;
}

interface LoginResponse {
  detail: string;
  result: {
    access_token: string;
    token_type: string;
    user: {
      id: string;
      username: string;
      role: string;
    };
  };
}

export const loginRequest = async (data: LoginData): Promise<LoginResponse> => {
  // 1. Asegúrate de que la URL sea 127.0.0.1 para evitar rollos de IPv6 en Arch
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // 2. El cuerpo DEBE ser un JSON que coincida con LoginSchema
    body: JSON.stringify({
      username: data.username, // Verifica si tu backend espera 'email' o 'username'
      password: data.password,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    // Si hay error 400, aquí verás el detalle en la consola
    console.error("Error detalle:", result);
    throw new Error(result.detail || "Error en los datos enviados");
  }

  return result;
};
