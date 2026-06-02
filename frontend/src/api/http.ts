export const readApiResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const detail = isJson && body && typeof body === "object" && "detail" in body
      ? String((body as { detail?: unknown }).detail)
      : typeof body === "string" && body.trim()
        ? body.trim()
        : `Error HTTP ${response.status}`;

    throw new Error(detail);
  }

  return body as T;
};
