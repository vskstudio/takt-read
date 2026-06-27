import { describe, it, expect } from 'vitest';
import { TaktError, errorFromResponse } from '../src/errors';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('errorFromResponse', () => {
  it('parses the nested error body', async () => {
    const res = jsonResponse(402, {
      error: { code: 'quota_api_depasse', message: 'quota dépassé', details: ['axe B'] },
    });
    const err = await errorFromResponse(res);
    expect(err).toBeInstanceOf(TaktError);
    expect(err.status).toBe(402);
    expect(err.code).toBe('quota_api_depasse');
    expect(err.message).toBe('quota dépassé');
    expect(err.details).toEqual(['axe B']);
  });

  it('falls back when the body is not JSON', async () => {
    const res = new Response('boom', { status: 500, statusText: 'Internal Server Error' });
    const err = await errorFromResponse(res);
    expect(err.status).toBe(500);
    expect(err.code).toBe('erreur_http');
    expect(err.message).toBe('Internal Server Error');
    expect(err.details).toBeUndefined();
  });

  it('falls back when the error object is missing', async () => {
    const res = jsonResponse(404, {});
    const err = await errorFromResponse(res);
    expect(err.status).toBe(404);
    expect(err.code).toBe('erreur_http');
  });
});
