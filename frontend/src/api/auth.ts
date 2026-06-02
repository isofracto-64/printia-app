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
  let response: Response;
  try {
    response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: data.username,
        password: data.password,
      }),
    });
  } catch {
    throw new Error(`No se pudo conectar con la API: ${API_URL}`);
  }

  const result = await response.json();

  if (!response.ok) {
    // Si hay error 400, aquí verás el detalle en la consola
    console.error("Error detalle:", result);
    throw new Error(result.detail || "Error en los datos enviados");
  }

  return result;
};
