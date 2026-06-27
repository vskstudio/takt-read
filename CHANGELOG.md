# @vskstudio/takt-read

## Unreleased

### Hardening

- `TaktClient` now rejects a `baseUrl` whose scheme is not `http:`/`https:`
  (e.g. `file:`, `ftp:`, `javascript:`), aligning the read SDK with the
  scheme validation already enforced in `@vskstudio/takt-core` and `takt-mcp`.
