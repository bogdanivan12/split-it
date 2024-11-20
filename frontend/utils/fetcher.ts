const BASE_URL = "url";

export const fetcher = async <T>({
  endpoint,
  token,
  headers,
  body,
  options,
  contentType = "application/json",
}: {
  endpoint: string;
  token?: string;
  body?: any;
  contentType?: string;
  headers?: Record<string, string>;
  options?: Record<string, string>;
}): Promise<T> => {
  const baseUrl = BASE_URL;

  const url = `${baseUrl}${endpoint}`;

  const apiHeaders: HeadersInit = {
    "Content-Type": contentType,
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      ...(body && { body: JSON.stringify(body) }),
      headers: apiHeaders,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(
        error?.message || `Error ${response.status}: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error: any) {
    console.error("Fetch error:", error);
    throw error;
  }
};
