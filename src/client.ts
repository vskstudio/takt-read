import { errorFromResponse } from './errors';
import { toSearchParams, type StatsQuery } from './query';
import type {
  StatsSummary,
  StatsTimeseries,
  StatsBreakdown,
  StatsRealtime,
  StatsGoals,
  FunnelReports,
  PropertyBreakdown,
  PropertyBatchRequest,
  PropertyBatchResponse,
  RevenueByCurrency,
} from './types';

export interface ClientOptions {
  apiKey: string;
  domain: string;
  baseUrl: string;
  fetch?: typeof fetch;
}

export interface TaktReadClient {
  summary(q?: StatsQuery): Promise<StatsSummary>;
  timeseries(q?: StatsQuery): Promise<StatsTimeseries>;
  breakdown(q: StatsQuery & { dimension: string }): Promise<StatsBreakdown>;
  realtime(): Promise<StatsRealtime>;
  goals(q?: StatsQuery): Promise<StatsGoals>;
  funnels(q?: StatsQuery): Promise<FunnelReports>;
  properties(event: string, q?: StatsQuery): Promise<string[]>;
  propertyBreakdown(event: string, key: string, q?: StatsQuery): Promise<PropertyBreakdown>;
  propertyBreakdownBatch(req: PropertyBatchRequest, q?: StatsQuery): Promise<PropertyBatchResponse>;
  revenue(event: string, q?: StatsQuery): Promise<RevenueByCurrency>;
}

export function createClient(opts: ClientOptions): TaktReadClient {
  const doFetch = opts.fetch ?? globalThis.fetch;
  const base = opts.baseUrl.replace(/\/$/, '');
  const sitePath = `${base}/sites/${opts.domain}/stats`;

  async function request<T>(
    op: string,
    q: StatsQuery,
    extra?: Record<string, string>,
    init?: RequestInit,
  ): Promise<T> {
    const sp = toSearchParams(q);
    if (extra) for (const [k, v] of Object.entries(extra)) sp.set(k, v);
    const qs = sp.toString();
    const url = `${sitePath}/${op}${qs ? `?${qs}` : ''}`;
    const res = await doFetch(url, {
      ...init,
      headers: {
        authorization: `Bearer ${opts.apiKey}`,
        ...(init?.body ? { 'content-type': 'application/json' } : {}),
        ...(init?.headers as Record<string, string> | undefined),
      },
    });
    if (!res.ok) throw await errorFromResponse(res);
    return (await res.json()) as T;
  }

  return {
    summary: (q = {}) => request('summary', q),
    timeseries: (q = {}) => request('timeseries', q),
    breakdown: (q) => request('breakdown', q),
    realtime: () => request('realtime', {}),
    goals: (q = {}) => request('goals', q),
    funnels: (q = {}) => request('funnels', q),
    properties: (event, q = {}) => request('properties', q, { event }),
    propertyBreakdown: (event, key, q = {}) => request('property-breakdown', q, { event, key }),
    propertyBreakdownBatch: (req, q = {}) =>
      request('property-breakdown/batch', q, undefined, {
        method: 'POST',
        body: JSON.stringify(req),
      }),
    revenue: (event, q = {}) => request('revenue', q, { event }),
  };
}
