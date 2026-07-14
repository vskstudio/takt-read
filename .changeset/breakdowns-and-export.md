---
'@vskstudio/takt-read': minor
---

Add the two remaining read endpoints so the SDK covers the full stats surface:

- `stats.breakdowns(dimensions, query?)` — several rankings in a single request
  (`GET /stats/breakdowns?dimensions=…`), returning a `StatsBreakdowns` map indexed by
  dimension. Throws `config_invalide` on an empty dimensions list (no request sent).
- `stats.export(query?)` — page ranking export on the org-scoped route
  (`GET /orgs/:org/sites/:domain/stats/export`). Default `format: 'csv'` returns the raw CSV
  string; `format: 'json'` returns typed `StatsExportRow[]`. Requires the new optional `org`
  client option; calling it without one throws `config_invalide`.

Also exports the new `StatsBreakdowns` and `StatsExportRow` types, and adds the `org` field to
`TaktClientOptions`.
