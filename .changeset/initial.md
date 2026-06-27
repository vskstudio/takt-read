---
'@vskstudio/takt-read': minor
---

Initial release: server-only TypeScript SDK for the Takt read API. Class-based architecture — `TaktClient` with a `stats` resource (summary, timeseries, breakdown, realtime, goals, funnels, properties, property breakdown, batch breakdown, revenue), a hardened HTTP transport (configurable timeout, retry with backoff on 429/5xx, `AbortSignal` support, bearer auth), option validation, and `TaktError` for typed error handling. Zero runtime dependencies, ESM + CJS.
