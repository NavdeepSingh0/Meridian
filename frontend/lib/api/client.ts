import axios, { AxiosError } from 'axios';
import { auth } from '../firebase/client';

export const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Create an axios instance for a sub-path of the API that attaches the
 * current Firebase ID token. `getIdToken()` returns the cached token and only
 * refreshes it when it is close to expiry, so this is cheap per request.
 */
export function createApiClient(path: string) {
  const client = axios.create({ baseURL: `${API_ORIGIN}${path}` });

  client.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
}

/**
 * Pull a human-readable message out of an API error. The backend returns
 * `{ error }` or `{ detail }` with a user-safe message; blob responses
 * (PDF export) can't be read synchronously so they fall back to the default.
 */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(err)) {
    const e = err as AxiosError<{ error?: string; detail?: string }>;
    const data = e.response?.data;
    if (data && typeof data === 'object') {
      if (typeof data.error === 'string') return data.error;
      if (typeof data.detail === 'string') return data.detail;
    }
    if (!e.response) return 'Cannot reach the server. Check your connection and try again.';
    if (e.response.status === 401) return 'Please sign in to continue.';
    if (e.response.status === 429) return "You're doing that too quickly. Please wait a moment.";
  }
  return fallback;
}

/**
 * Like `getErrorMessage`, but also handles error responses that arrived as a Blob
 * (requests made with `responseType: 'blob'`, i.e. PDF export).
 */
export async function getErrorMessageAsync(err: unknown, fallback?: string): Promise<string> {
  if (axios.isAxiosError(err) && err.response?.data instanceof Blob) {
    try {
      const parsed = JSON.parse(await err.response.data.text());
      const message = parsed?.detail ?? parsed?.error;
      if (typeof message === 'string') return message;
    } catch {
      /* not JSON — fall through */
    }
  }
  return getErrorMessage(err, fallback);
}

export function getErrorStatus(err: unknown): number | undefined {
  return axios.isAxiosError(err) ? err.response?.status : undefined;
}
