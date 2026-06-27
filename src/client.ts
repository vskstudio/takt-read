import TaktError from './errors';
import HttpTransport from './http/transport';
import StatsResource from './resources/stats';

export interface TaktClientOptions {
  apiKey: string;
  domain: string;
  baseUrl: string;
  fetch?: typeof fetch;
  timeoutMs?: number;
  retries?: number;
}

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_RETRIES = 2;

export default class TaktClient {
  readonly stats: StatsResource;

  constructor(options: TaktClientOptions) {
    if (!options.apiKey) throw new TaktError(0, 'config_invalide', 'apiKey requis');
    if (!options.domain) throw new TaktError(0, 'config_invalide', 'domain requis');
    if (!options.baseUrl) throw new TaktError(0, 'config_invalide', 'baseUrl requis');

    let parsed: URL;
    try {
      parsed = new URL(options.baseUrl);
    } catch {
      throw new TaktError(0, 'config_invalide', 'baseUrl invalide');
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new TaktError(0, 'config_invalide', 'baseUrl doit utiliser le schéma http(s)');
    }

    const fetchImpl = options.fetch ?? globalThis.fetch;
    if (typeof fetchImpl !== 'function') {
      throw new TaktError(0, 'config_invalide', 'fetch indisponible : fournissez options.fetch');
    }

    const transport = new HttpTransport({
      baseUrl: parsed.toString().replace(/\/$/, ''),
      apiKey: options.apiKey,
      fetch: fetchImpl,
      timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
      retries: Math.max(0, options.retries ?? DEFAULT_RETRIES),
    });

    this.stats = new StatsResource(transport, options.domain);
  }
}
