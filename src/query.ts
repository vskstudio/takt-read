export type Period = 'day' | '7d' | '30d' | 'month' | '6mo' | '12mo';
export type Interval = 'hour' | 'day' | 'week' | 'month';

export interface SegmentFilter {
  dim: string;
  op: string;
  val: string;
  join?: 'and' | 'or';
}

export interface StatsQuery {
  period?: Period;
  from?: string;
  to?: string;
  tz?: string;
  country?: string;
  segment?: SegmentFilter[];
  interval?: Interval;
  compare?: boolean;
  limit?: number;
  dimension?: string;
}

export function toSearchParams(q: StatsQuery): URLSearchParams {
  const sp = new URLSearchParams();
  const set = (k: string, v: string | number | boolean | undefined) => {
    if (v !== undefined) sp.set(k, String(v));
  };

  set('period', q.period);
  set('from', q.from);
  set('to', q.to);
  set('tz', q.tz);
  set('country', q.country);
  set('interval', q.interval);
  set('compare', q.compare);
  set('limit', q.limit);
  set('dimension', q.dimension);

  if (q.segment) {
    q.segment.forEach((s, i) => {
      sp.append('segment', `${s.dim}:${s.op}:${s.val}`);
      // segment_join est décalé d'un cran : une entrée par filtre après le premier.
      if (i > 0) sp.append('segment_join', s.join ?? 'and');
    });
  }
  return sp;
}
