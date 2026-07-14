export type Period = 'day' | '7d' | '30d' | 'month' | '6mo' | '12mo';
export type Interval = 'hour' | 'day' | 'week' | 'month';

// Dimensions filtrables par segment (les singuliers comme "page"/"source" ne le sont pas).
export type SegmentDimension =
  | 'pages'
  | 'sources'
  | 'countries'
  | 'regions'
  | 'cities'
  | 'os'
  | 'browsers'
  | 'devices'
  | 'utm_source'
  | 'utm_medium'
  | 'utm_campaign';

// Seuls "is" et "not" sont acceptés par l'API ("contains" et consorts sont rejetés).
export type SegmentOperator = 'is' | 'not';

export interface SegmentFilter {
  dim: SegmentDimension;
  op: SegmentOperator;
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
