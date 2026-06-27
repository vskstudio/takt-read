import { describe, it, expect } from 'vitest';
import TaktClient from '../src/client';
import StatsResource from '../src/resources/stats';
import TaktError from '../src/errors';

const ok: typeof fetch = async () =>
  new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });

function client(over: Partial<ConstructorParameters<typeof TaktClient>[0]> = {}) {
  return new TaktClient({
    apiKey: 'sk',
    domain: 'example.com',
    baseUrl: 'https://api.takt.test/api/v1',
    fetch: ok,
    ...over,
  });
}

describe('TaktClient', () => {
  it('exposes a stats resource', () => {
    expect(client().stats).toBeInstanceOf(StatsResource);
  });

  it('rejects a missing apiKey', () => {
    expect(() => client({ apiKey: '' })).toThrow(TaktError);
  });

  it('rejects a missing domain', () => {
    expect(() => client({ domain: '' })).toThrow(TaktError);
  });

  it('rejects an invalid baseUrl', () => {
    expect(() => client({ baseUrl: 'not a url' })).toThrowError(/baseUrl invalide/);
  });

  it('rejects a non-http(s) baseUrl scheme', () => {
    for (const baseUrl of ['file:///etc/passwd', 'ftp://host/x', 'javascript:alert(1)']) {
      expect(() => client({ baseUrl })).toThrowError(/schéma http/);
    }
  });

  it('drives a real call through the stats resource', async () => {
    const calls: string[] = [];
    const spy: typeof fetch = async (input) => {
      calls.push(String(input));
      return new Response('{"visitors":3}', { status: 200, headers: { 'content-type': 'application/json' } });
    };
    const out = await client({ baseUrl: 'https://api.takt.test/api/v1/', fetch: spy }).stats.summary();
    expect(out.visitors).toBe(3);
    // trailing slash on baseUrl is normalised away
    expect(calls[0]).toBe('https://api.takt.test/api/v1/sites/example.com/stats/summary');
  });
});
