import { describe, it, expect, vi } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';

// client.ts imports Firebase; the error helpers don't need it.
vi.mock('../firebase/client', () => ({ auth: { currentUser: null } }));

import { getErrorMessage, getErrorMessageAsync, getErrorStatus } from './client';

function axiosError(status: number | null, data?: unknown) {
  const config = { headers: new AxiosHeaders() };
  const response =
    status === null ? undefined : { status, data, statusText: '', headers: {}, config };
  return new AxiosError('boom', 'ERR', config, {}, response as never);
}

describe('getErrorMessage', () => {
  it('prefers the server-provided `error` message', () => {
    expect(getErrorMessage(axiosError(402, { error: 'You have run out of AI credits.' }))).toBe(
      'You have run out of AI credits.',
    );
  });

  it('falls back to `detail`', () => {
    expect(getErrorMessage(axiosError(422, { detail: 'This PDF appears to be scanned.' }))).toBe(
      'This PDF appears to be scanned.',
    );
  });

  it('explains network failures', () => {
    expect(getErrorMessage(axiosError(null))).toMatch(/cannot reach the server/i);
  });

  it('asks the user to sign in on 401', () => {
    expect(getErrorMessage(axiosError(401, {}))).toMatch(/sign in/i);
  });

  it('uses the fallback for unknown errors', () => {
    expect(getErrorMessage(new Error('x'), 'custom fallback')).toBe('custom fallback');
  });
});

describe('getErrorMessageAsync', () => {
  it('reads messages out of Blob error bodies (PDF export)', async () => {
    const blob = new Blob([JSON.stringify({ detail: 'Invalid template.' })], { type: 'application/json' });
    expect(await getErrorMessageAsync(axiosError(400, blob))).toBe('Invalid template.');
  });
});

describe('getErrorStatus', () => {
  it('returns the HTTP status for axios errors only', () => {
    expect(getErrorStatus(axiosError(404, {}))).toBe(404);
    expect(getErrorStatus(new Error('x'))).toBeUndefined();
  });
});
