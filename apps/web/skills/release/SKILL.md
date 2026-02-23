---
name: release
description: Prepare and publish a new version release with changelog and git tags
version: 1.0.0
category: git
tags: [git, release, semver, changelog, versioning]
author: Skills Marketplace
license: MIT
---

Prepare and publish a versioned release for this project.

## Steps

1. **Determine the version bump** — review commits since the last tag and apply semver rules (see `references/semver.md`). Use the highest applicable bump across all changes.

2. **Update version** — bump the version field in `package.json` (and any other manifest files the project uses).

3. **Generate changelog** — append a new section to `CHANGELOG.md` (create it if absent) using this format:

   ```
   ## [x.y.z] — YYYY-MM-DD

   ### Breaking Changes
   - ...

   ### Features
   - ...

   ### Bug Fixes
   - ...
   ```

   Pull entries from commit messages since the previous tag. Group by type. Skip chore/ci entries unless they're user-visible.

4. **Run the pre-release checklist** — work through every item in `checklists/pre-release.md` before continuing.

5. **Commit and tag**:
   ```
   git add package.json CHANGELOG.md
   git commit -m "chore: release vx.y.z"
   git tag vx.y.z
   ```

6. **Push** — push the commit and tag:
   ```
   git push && git push --tags
   ```

7. **Report** — summarise what changed, what version was released, and any items from the checklist that required manual attention.
