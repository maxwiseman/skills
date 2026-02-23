# Semantic Versioning Reference

Version format: `MAJOR.MINOR.PATCH` (e.g. `2.4.1`)

## Bump Rules

| Commit type | Version bump |
|-------------|-------------|
| Breaking change (`!` suffix or `BREAKING CHANGE` footer) | **MAJOR** |
| `feat` | **MINOR** |
| `fix`, `perf`, `refactor` (no breaking) | **PATCH** |
| `docs`, `chore`, `ci`, `test`, `style` | none (unless explicitly bumped) |

## Pre-1.0 Projects

- `0.y.z` — anything goes; breaking changes may be MINOR bumps
- Graduate to `1.0.0` when the public API is stable

## Pre-release & Build Metadata

```
1.0.0-alpha.1      # pre-release, lower precedence than 1.0.0
1.0.0+20240101     # build metadata, ignored for precedence
1.0.0-rc.2+sha.abc # both
```

## Precedence

`1.0.0-alpha` < `1.0.0-alpha.1` < `1.0.0-beta` < `1.0.0-rc.1` < `1.0.0`

## Common Mistakes

- Never re-use a version number — once published, it is immutable
- `v` prefix in git tags (`v1.2.3`) is convention, not part of the version
- Patch bumps are for backwards-compatible bug fixes only — a new optional parameter is MINOR
