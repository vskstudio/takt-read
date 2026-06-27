import { describe, it, expect } from 'vitest';
import HttpTransport from '../src/http/transport';
import StatsResource from '../src/resources/stats';

function recorder(body: unknown = {}) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fn: typeof fetch = async (input, init) => {
    calls.push({ url: String(input), init: init ?? {} });
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };
  const transport = new HttpTransport({
    baseUrl: 'https://api.takt.test/api/v1',
    apiKey: 'k',
    fetch: fn,
    timeoutMs: 1000,
    retries: 0,
  });
  return { stats: new StatsResource(transport, 'example.com'), calls };
}

function urlOf(call: { url: string }): URL {
  return new URL(call.url);
}

describe('StatsResource', () => {
  it('routes summary with serialized query', async () => {
    const r = recorder({ visitors: 1 });
    await r.stats.summary({ period: '7d', compare: true });
    const u = urlOf(r.calls[0]!);
    expect(u.pathname).toBe('/api/v1/sites/example.com/stats/summary');
    expect(u.searchParams.get('period')).toBe('7d');
    expect(u.searchParams.get('compare')).toBe('true');
  });

  it('encodes a single segment without a join', async () => {
    const r = recorder();
    await r.stats.breakdown({ dimension: 'page', segment: [{ dim: 'country', op: 'is', val: 'FR' }] });
    const u = urlOf(r.calls[0]!);
    expect(u.pathname).toBe('/api/v1/sites/example.com/stats/breakdown');
    expect(u.searchParams.get('dimension')).toBe('page');
    expect(u.searchParams.getAll('segment')).toEqual(['country:is:FR']);
    expect(u.searchParams.getAll('segment_join')).toEqual([]);
  });

  it('offsets segment_join by one for multiple segments', async () => {
    const r = recorder();
    await r.stats.summary({
      segment: [
        { dim: 'country', op: 'is', val: 'FR' },
        { dim: 'browser', op: 'is', val: 'Firefox', join: 'or' },
        { dim: 'page', op: 'contains', val: '/blog' },
      ],
    });
    const u = urlOf(r.calls[0]!);
    expect(u.searchParams.getAll('segment')).toEqual([
      'country:is:FR',
      'browser:is:Firefox',
      'page:contains:/blog',
    ]);
    expect(u.searchParams.getAll('segment_join')).toEqual(['or', 'and']);
  });

  it('requires event for properties', async () => {
    const r = recorder(['a', 'b']);
    const out = await r.stats.properties('signup', { period: 'day' });
    expect(out).toEqual(['a', 'b']);
    const u = urlOf(r.calls[0]!);
    expect(u.pathname).toBe('/api/v1/sites/example.com/stats/properties');
    expect(u.searchParams.get('event')).toBe('signup');
    expect(u.searchParams.get('period')).toBe('day');
  });

  it('requires event and key for property-breakdown', async () => {
    const r = recorder();
    await r.stats.propertyBreakdown('signup', 'plan');
    const u = urlOf(r.calls[0]!);
    expect(u.pathname).toBe('/api/v1/sites/example.com/stats/property-breakdown');
    expect(u.searchParams.get('event')).toBe('signup');
    expect(u.searchParams.get('key')).toBe('plan');
  });

  it('posts a JSON body for the batch breakdown', async () => {
    const r = recorder({ items: [] });
    await r.stats.propertyBreakdownBatch({ items: [{ event: 'signup', key: 'plan' }] });
    const call = r.calls[0]!;
    expect(urlOf(call).pathname).toBe('/api/v1/sites/example.com/stats/property-breakdown/batch');
    expect(call.init.method).toBe('POST');
    expect(call.init.body).toBe('{"items":[{"event":"signup","key":"plan"}]}');
  });

  it('escapes the domain in the path', async () => {
    const r = recorder();
    const transport = new HttpTransport({
      baseUrl: 'https://api.takt.test/api/v1',
      apiKey: 'k',
      fetch: async (input) => {
        r.calls.push({ url: String(input), init: {} });
        return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
      },
      timeoutMs: 1000,
      retries: 0,
    });
    await new StatsResource(transport, 'a/b').realtime();
    expect(urlOf(r.calls[0]!).pathname).toBe('/api/v1/sites/a%2Fb/stats/realtime');
  });
});
