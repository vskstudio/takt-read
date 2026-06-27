import { describe, it, expect } from 'vitest';
import HttpTransport from '../src/http/transport';
import TaktError from '../src/errors';

interface Call {
  url: string;
  init: RequestInit;
}

function sequencedFetch(responses: Array<() => Response | Promise<Response>>) {
  const calls: Call[] = [];
  let i = 0;
  const fn: typeof fetch = async (input, init) => {
    calls.push({ url: String(input), init: init ?? {} });
    const make = responses[Math.min(i, responses.length - 1)]!;
    i += 1;
    return make();
  };
  return { fn, calls, count: () => i };
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function transport(fetchFn: typeof fetch, over: Partial<{ timeoutMs: number; retries: number }> = {}) {
  return new HttpTransport({
    baseUrl: 'https://api.takt.test/api/v1',
    apiKey: 'sk_test',
    fetch: fetchFn,
    timeoutMs: over.timeoutMs ?? 1000,
    retries: over.retries ?? 0,
  });
}

describe('HttpTransport', () => {
  it('sends the bearer token and builds the URL with query', async () => {
    const stub = sequencedFetch([() => json(200, { ok: true })]);
    const t = transport(stub.fn);
    const params = new URLSearchParams({ period: '7d' });
    const out = await t.request<{ ok: boolean }>('GET', '/sites/x/stats/summary', { query: params });
    expect(out.ok).toBe(true);
    expect(stub.calls[0]!.url).toBe('https://api.takt.test/api/v1/sites/x/stats/summary?period=7d');
    const headers = stub.calls[0]!.init.headers as Record<string, string>;
    expect(headers.authorization).toBe('Bearer sk_test');
    expect(headers.accept).toBe('application/json');
  });

  it('serializes a JSON body and sets content-type', async () => {
    const stub = sequencedFetch([() => json(200, {})]);
    const t = transport(stub.fn);
    await t.request('POST', '/p', { body: { a: 1 } });
    expect(stub.calls[0]!.init.method).toBe('POST');
    expect(stub.calls[0]!.init.body).toBe('{"a":1}');
    const headers = stub.calls[0]!.init.headers as Record<string, string>;
    expect(headers['content-type']).toBe('application/json');
  });

  it('maps a non-ok response to a TaktError', async () => {
    const stub = sequencedFetch([() => json(402, { error: { code: 'quota_api_depasse', message: 'q' } })]);
    const t = transport(stub.fn);
    await expect(t.request('GET', '/p')).rejects.toMatchObject({ status: 402, code: 'quota_api_depasse' });
  });

  it('does not retry a 4xx', async () => {
    const stub = sequencedFetch([() => json(400, { error: { code: 'bad' } })]);
    const t = transport(stub.fn, { retries: 3 });
    await expect(t.request('GET', '/p')).rejects.toBeInstanceOf(TaktError);
    expect(stub.count()).toBe(1);
  });

  it('retries a 5xx then succeeds', async () => {
    const stub = sequencedFetch([() => json(503, {}), () => json(200, { ok: 1 })]);
    const t = transport(stub.fn, { retries: 2 });
    const out = await t.request<{ ok: number }>('GET', '/p');
    expect(out.ok).toBe(1);
    expect(stub.count()).toBe(2);
  });

  it('retries a network error then gives up as erreur_reseau', async () => {
    const stub = sequencedFetch([
      () => {
        throw new TypeError('fetch failed');
      },
    ]);
    const t = transport(stub.fn, { retries: 1 });
    await expect(t.request('GET', '/p')).rejects.toMatchObject({ code: 'erreur_reseau' });
    expect(stub.count()).toBe(2);
  });

  const abortAwareFetch: typeof fetch = (_input, init) =>
    new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () =>
        reject(new DOMException('aborted', 'AbortError')),
      );
    });

  it('times out a slow request', async () => {
    const t = transport(abortAwareFetch, { timeoutMs: 20, retries: 0 });
    await expect(t.request('GET', '/p')).rejects.toMatchObject({ code: 'timeout' });
  });

  it('propagates an external abort', async () => {
    const t = transport(abortAwareFetch, { timeoutMs: 1000, retries: 2 });
    const ac = new AbortController();
    const p = t.request('GET', '/p', { signal: ac.signal });
    ac.abort();
    await expect(p).rejects.toThrow();
  });
});
