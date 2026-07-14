---
'@vskstudio/takt-read': patch
---

Fix the default `baseUrl` so the SDK works out of the box against the hosted API.

The default pointed at the bare site origin (`https://taktlytics.com`), but resource paths are
`/sites/:domain/stats/...` with no `/api/v1` prefix — so an out-of-the-box
`new TaktClient({ apiKey, domain })` requested `https://taktlytics.com/sites/...`, which serves the
marketing SPA and fails with `TaktError: Unexpected token '<' ... is not valid JSON`. The default is
now the hosted read API root (`https://taktlytics.com/api/v1`), matching the `baseUrl` contract
(the value paths are appended to). Explicit `baseUrl` values are unaffected — they already had to
include `/api/v1`.
