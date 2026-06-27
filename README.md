# @vskstudio/takt-read

Server-only TypeScript SDK for the Takt read API. Query your analytics — summary, timeseries, breakdowns, realtime, goals, funnels, custom properties and revenue — with a typed client.

> **Server-only.** Your read API key is a secret. Use this SDK on a server (API route, cron, backend service) — never ship it to a browser bundle.

## Install

```bash
npm install @vskstudio/takt-read
# or: pnpm add @vskstudio/takt-read
```

Requires Node.js 18+ (uses the global `fetch`).

## Quick start

```ts
import { createClient } from '@vskstudio/takt-read';

const takt = createClient({
  apiKey: process.env.TAKT_API_KEY!, // secret — keep it server-side
  domain: 'example.com',
  baseUrl: 'https://your-takt-instance.example/api/v1',
});

const summary = await takt.summary({ period: '30d' });
console.log(summary.visitors, summary.pageviews);
```

`baseUrl` is required: point it at your Takt instance's `/api/v1` root.

## Methods

| Method | Returns |
| --- | --- |
| `summary(query?)` | `StatsSummary` |
| `timeseries(query?)` | `StatsTimeseries` |
| `breakdown(query & { dimension })` | `StatsBreakdown` |
| `realtime()` | `StatsRealtime` |
| `goals(query?)` | `StatsGoals` |
| `funnels(query?)` | `FunnelReports` |
| `properties(event, query?)` | `string[]` |
| `propertyBreakdown(event, key, query?)` | `PropertyBreakdown` |
| `propertyBreakdownBatch(request, query?)` | `PropertyBatchResponse` |
| `revenue(event, query?)` | `RevenueByCurrency` |

## Query options

All read methods accept an optional `StatsQuery`:

```ts
await takt.timeseries({
  period: '30d',          // 'day' | '7d' | '30d' | 'month' | '6mo' | '12mo'
  interval: 'day',        // 'hour' | 'day' | 'week' | 'month'
  tz: 'Europe/Paris',
  compare: true,          // include the previous period
  country: 'FR',
  segment: [
    { dim: 'browser', op: 'is', val: 'Firefox' },
    { dim: 'page', op: 'contains', val: '/blog', join: 'or' },
  ],
});
```

Use `from`/`to` (ISO dates) instead of `period` for a custom window.

## Error handling

Non-2xx responses throw a `TaktError` carrying the HTTP status and the API's error code:

```ts
import { TaktError } from '@vskstudio/takt-read';

try {
  await takt.summary();
} catch (err) {
  if (err instanceof TaktError) {
    console.error(err.status, err.code, err.message);
    if (err.code === 'quota_api_depasse') {
      // read quota exhausted
    }
  }
}
```

## License

UNLICENSED — proprietary. © vskstudio.

---

# @vskstudio/takt-read (Français)

SDK TypeScript côté serveur pour l'API de lecture Takt. Interrogez vos statistiques — résumé, séries temporelles, répartitions, temps réel, objectifs, tunnels, propriétés personnalisées et revenus — avec un client typé.

> **Côté serveur uniquement.** Votre clé d'API de lecture est secrète. Utilisez ce SDK sur un serveur (route API, cron, service backend) — ne l'embarquez jamais dans un bundle navigateur.

## Installation

```bash
npm install @vskstudio/takt-read
```

Nécessite Node.js 18+ (utilise le `fetch` global).

## Démarrage rapide

```ts
import { createClient } from '@vskstudio/takt-read';

const takt = createClient({
  apiKey: process.env.TAKT_API_KEY!, // secret — à garder côté serveur
  domain: 'example.com',
  baseUrl: 'https://votre-instance-takt.example/api/v1',
});

const resume = await takt.summary({ period: '30d' });
```

`baseUrl` est obligatoire : pointez-le vers la racine `/api/v1` de votre instance Takt.

## Gestion des erreurs

Les réponses non-2xx lèvent une `TaktError` portant le statut HTTP et le code d'erreur de l'API (par exemple `quota_api_depasse` lorsque le quota de lecture est dépassé).

## Licence

UNLICENSED — propriétaire. © vskstudio.
