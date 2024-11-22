import { ApiError } from "@/types/ApiError.types";
import { BASE_URL } from "@env";

export type HTTPMethod = "POST" | "GET" | "PUT" | "DELETE";

export const fetcher = async <T>({
  endpoint,
  method,
  headers,
  body,
  options,
  contentType = "application/json",
}: {
  endpoint: string;
  method: HTTPMethod;
  body?: any;
  contentType?: string;
  headers?: Record<string, string>;
  options?: Record<string, string>;
}): Promise<T> => {
  const baseUrl = BASE_URL;

  const isFormData = contentType === "multipart/form-data";

  const url = `${baseUrl}${endpoint}`;
  if (isFormData) {
    const formData = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      formData.append(key, value as any);
    });
    body = formData;
  }
  const apiHeaders: HeadersInit = {
    "Content-Type": contentType,
    ...(headers || {}),
  };

  console.log(`headers: ${JSON.stringify(apiHeaders)}`)

  try {
    const response = await fetch(url, {
      ...options,
      ...(body && { body: isFormData ? body : JSON.stringify(body) }),
      method,
      headers: apiHeaders,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new ApiError(
        response.status,
        error instanceof String ? { error: error } : error
      );
    }
    return await response.json();
  } catch (error: any) {
    console.error("Fetch error:", JSON.stringify(error));
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, { error: "Internal server error." });
  }
};
