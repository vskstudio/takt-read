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
