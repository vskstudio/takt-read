# @vskstudio/takt-read

## 0.2.0

### Minor

- `baseUrl` is now optional and defaults to the hosted Takt origin
  (`https://taktlytics.com`), so `TaktClient` works out of the box and stays
  consistent with the other Takt SDKs. Pass `baseUrl` to target a self-hosted
  instance; when provided it is still validated (http(s) scheme) and normalised
  (trailing slash stripped) exactly as before.

### Hardening

- `TaktClient` now rejects a `baseUrl` whose scheme is not `http:`/`https:`
  (e.g. `file:`, `ftp:`, `javascript:`), aligning the read SDK with the
  scheme validation already enforced in `@vskstudio/takt-core` and `takt-mcp`.
