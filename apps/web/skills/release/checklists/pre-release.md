# Pre-Release Checklist

Work through every item before tagging. Note any that required action.

## Code Quality

- [ ] All CI checks pass on the release branch
- [ ] No `console.log`, `debugger`, or `TODO` left in changed files
- [ ] Dependency versions are pinned or locked (`bun.lock` / `package-lock.json` committed)
- [ ] No unused dependencies introduced since last release

## Tests

- [ ] Full test suite passes locally (`bun test` or equivalent)
- [ ] New features have test coverage
- [ ] No tests skipped with `.only` or `.skip`

## Documentation

- [ ] Public API changes are reflected in README or docs
- [ ] CHANGELOG entry is written and accurate
- [ ] Migration guide added if there are breaking changes

## Security

- [ ] No secrets or credentials committed
- [ ] Dependencies audited (`bun audit` or equivalent)
- [ ] Breaking changes clearly marked as such

## Versioning

- [ ] Version bumped correctly per semver (see `references/semver.md`)
- [ ] Git tag matches the version in `package.json`
- [ ] Previous tag exists and `git log` range looks correct
