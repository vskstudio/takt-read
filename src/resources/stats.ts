import type HttpTransport from '../http/transport';
import type { RequestOptions } from '../http/transport';
import type { StatsQuery } from '../query';
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
} from '../types';

export interface CallOptions {
  signal?: AbortSignal;
}

export default class StatsResource {
  readonly #http: HttpTransport;
  readonly #base: string;

  constructor(http: HttpTransport, domain: string) {
    this.#http = http;
    this.#base = `/sites/${encodeURIComponent(domain)}/stats`;
  }

  summary(query: StatsQuery = {}, options?: CallOptions): Promise<StatsSummary> {
    return this.#get('summary', query, options);
  }

  timeseries(query: StatsQuery = {}, options?: CallOptions): Promise<StatsTimeseries> {
    return this.#get('timeseries', query, options);
  }

  breakdown(query: StatsQuery & { dimension: string }, options?: CallOptions): Promise<StatsBreakdown> {
    return this.#get('breakdown', query, options);
  }

  realtime(options?: CallOptions): Promise<StatsRealtime> {
    return this.#get('realtime', {}, options);
  }

  goals(query: StatsQuery = {}, options?: CallOptions): Promise<StatsGoals> {
    return this.#get('goals', query, options);
  }

  funnels(query: StatsQuery = {}, options?: CallOptions): Promise<FunnelReports> {
    return this.#get('funnels', query, options);
  }

  properties(event: string, query: StatsQuery = {}, options?: CallOptions): Promise<string[]> {
    return this.#get('properties', query, options, { event });
  }

  propertyBreakdown(
    event: string,
    key: string,
    query: StatsQuery = {},
    options?: CallOptions,
  ): Promise<PropertyBreakdown> {
    return this.#get('property-breakdown', query, options, { event, key });
  }

  propertyBreakdownBatch(
    request: PropertyBatchRequest,
    query: StatsQuery = {},
    options?: CallOptions,
  ): Promise<PropertyBatchResponse> {
    return this.#http.request('POST', `${this.#base}/property-breakdown/batch`, {
      query: StatsResource.#params(query),
      body: request,
      signal: options?.signal,
    });
  }

  revenue(event: string, query: StatsQuery = {}, options?: CallOptions): Promise<RevenueByCurrency> {
    return this.#get('revenue', query, options, { event });
  }

  #get<T>(
    op: string,
    query: StatsQuery,
    options?: CallOptions,
    extra?: Record<string, string>,
  ): Promise<T> {
    const params = StatsResource.#params(query);
    if (extra) for (const [k, v] of Object.entries(extra)) params.set(k, v);
    const init: RequestOptions = { query: params };
    if (options?.signal) init.signal = options.signal;
    return this.#http.request('GET', `${this.#base}/${op}`, init);
  }

  static #params(query: StatsQuery): URLSearchParams {
    const params = new URLSearchParams();
    const set = (key: string, value: string | number | boolean | undefined) => {
      if (value !== undefined) params.set(key, String(value));
    };

    set('period', query.period);
    set('from', query.from);
    set('to', query.to);
    set('tz', query.tz);
    set('country', query.country);
    set('interval', query.interval);
    set('compare', query.compare);
    set('limit', query.limit);
    set('dimension', query.dimension);

    query.segment?.forEach((s, i) => {
      params.append('segment', `${s.dim}:${s.op}:${s.val}`);
      // segment_join est décalé d'un cran : une entrée par filtre après le premier.
      if (i > 0) params.append('segment_join', s.join ?? 'and');
    });
    return params;
  }
}
