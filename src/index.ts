export { createClient } from './client';
export type { ClientOptions, TaktReadClient } from './client';
export { TaktError } from './errors';
export type { StatsQuery, SegmentFilter, Period, Interval } from './query';
export { toSearchParams } from './query';
export type {
  StatsSummary,
  StatsSummaryFigures,
  StatsTimeseries,
  StatsTimePoint,
  StatsBreakdown,
  StatsBreakdownRow,
  StatsRealtime,
  StatsGoals,
  GoalConversion,
  RevenueByCurrency,
  FunnelReports,
  FunnelReportEntry,
  FunnelReport,
  FunnelReportStep,
  PropertyBreakdown,
  PropertyBatchRequest,
  PropertyBatchQuery,
  PropertyBatchResponse,
  PropertyBatchResult,
} from './types';
