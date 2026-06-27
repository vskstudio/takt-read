import { describe, it, expect } from 'vitest';
import { createClient } from '../src/client';
import { TaktError } from '../src/errors';

interface Call {
  url: string;
  init?: RequestInit;
}

function stubFetch(status: number, body: unknown) {
  const calls: Call[] = [];
  const fn: typeof fetch = async (input, init) => {
    calls.push({ url: String(input), init });
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    });
  };
  const firstCall = () => {
    const c = calls[0];
    if (!c) throw new Error('fetch was not called');
    return c;
  };
  return { fn, calls, firstCall };
}

function makeClient(stub: ReturnType<typeof stubFetch>) {
  return createClient({
    apiKey: 'sk_test',
    domain: 'example.com',
    baseUrl: 'https://api.takt.test/api/v1',
    fetch: stub.fn,
  });
}

describe('createClient', () => {
  it('builds the summary URL and sends the bearer token', async () => {
    const stub = stubFetch(200, { visitors: 1, sessions: 1, pageviews: 1, bounceRate: 0, avgDurationS: 0 });
    const client = makeClient(stub);
    const out = await client.summary({ period: '7d' });
    expect(out.visitors).toBe(1);
    expect(stub.firstCall().url).toBe(
      'https://api.takt.test/api/v1/sites/example.com/stats/summary?period=7d',
    );
    const headers = stub.firstCall().init?.headers as Record<string, string>;
    expect(headers.authorization).toBe('Bearer sk_test');
  });

  it('strips a trailing slash from baseUrl', async () => {
    const stub = stubFetch(200, { visitors: 0 });
    const client = createClient({
      apiKey: 'k',
      domain: 'example.com',
      baseUrl: 'https://api.takt.test/api/v1/',
      fetch: stub.fn,
    });
    await client.realtime();
    expect(stub.firstCall().url).toBe('https://api.takt.test/api/v1/sites/example.com/stats/realtime');
  });

  it('appends required query params for properties', async () => {
    const stub = stubFetch(200, ['a', 'b']);
    const client = makeClient(stub);
    const out = await client.properties('signup', { period: 'day' });
    expect(out).toEqual(['a', 'b']);
    expect(stub.firstCall().url).toContain('/stats/properties?');
    expect(stub.firstCall().url).toContain('period=day');
    expect(stub.firstCall().url).toContain('event=signup');
  });

  it('appends event and key for property-breakdown', async () => {
    const stub = stubFetch(200, []);
    const client = makeClient(stub);
    await client.propertyBreakdown('signup', 'plan');
    expect(stub.firstCall().url).toContain('/stats/property-breakdown?');
    expect(stub.firstCall().url).toContain('event=signup');
    expect(stub.firstCall().url).toContain('key=plan');
  });

  it('posts a JSON body for the batch breakdown', async () => {
    const stub = stubFetch(200, { items: [] });
    const client = makeClient(stub);
    await client.propertyBreakdownBatch({ items: [{ event: 'signup', key: 'plan' }] });
    expect(stub.firstCall().url).toContain('/stats/property-breakdown/batch');
    expect(stub.firstCall().init?.method).toBe('POST');
    expect(stub.firstCall().init?.body).toBe('{"items":[{"event":"signup","key":"plan"}]}');
    const headers = stub.firstCall().init?.headers as Record<string, string>;
    expect(headers['content-type']).toBe('application/json');
  });

  it('throws a TaktError on a non-ok response', async () => {
    const stub = stubFetch(402, { error: { code: 'quota_api_depasse', message: 'quota' } });
    const client = makeClient(stub);
    await expect(client.summary()).rejects.toBeInstanceOf(TaktError);
  });
});
