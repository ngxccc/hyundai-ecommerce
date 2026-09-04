import { cookies } from "next/headers";

export interface ApiProblemDetails {
  type?: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  invalidParams?: Array<{
    name: string;
    reason: string;
  }>;
}

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly problem?: ApiProblemDetails;

  constructor(message: string, status: number, problem?: ApiProblemDetails) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.problem = problem;
  }
}

const getBaseUrl = (): string => {
  return process.env["BACKEND_API_URL"] || "http://127.0.0.1:3000";
};

export async function customMutator<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const baseUrl = getBaseUrl();
  const fullUrl = url.startsWith("http")
    ? url
    : `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  try {
    const cookieStore = await cookies();
    const token =
      cookieStore.get("adminAccessToken")?.value ||
      cookieStore.get("accessToken")?.value;
    if (token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  } catch {
    // Non-request context (e.g. background job / build)
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  if (!response.ok) {
    let errorDetails: ApiProblemDetails | undefined;
    if (isJson) {
      try {
        errorDetails = (await response.json()) as ApiProblemDetails;
      } catch {
        // Not valid JSON
      }
    }

    const message =
      errorDetails?.detail ||
      errorDetails?.title ||
      `Request failed with HTTP ${response.status}: ${response.statusText}`;

    throw new ApiClientError(message, response.status, errorDetails);
  }

  if (!isJson) {
    return (await response.text()) as unknown as T;
  }

  const body = (await response.json()) as { success?: boolean; data?: T } | T;
  if (body && typeof body === "object" && "data" in body) {
    return body.data as T;
  }
  return body as T;
}

export default customMutator;
