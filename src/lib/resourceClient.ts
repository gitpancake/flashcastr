async function parseOrThrow<T>(response: Response, errorMessage: string): Promise<T> {
  if (!response.ok) {
    throw new Error(`${errorMessage}: ${response.status}`);
  }
  return response.json();
}

export async function getResource<T>(
  endpoint: string,
  params: Record<string, string | number | boolean | undefined>,
  errorMessage: string
): Promise<T> {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      query.set(key, String(value));
    }
  }
  const qs = query.toString();
  const response = await fetch(qs ? `${endpoint}?${qs}` : endpoint);
  return parseOrThrow<T>(response, errorMessage);
}

export async function postResource<T>(
  endpoint: string,
  body: object,
  errorMessage: string
): Promise<T> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseOrThrow<T>(response, errorMessage);
}
