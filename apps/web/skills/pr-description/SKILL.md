---
name: pr-description
description: Write a clear pull request title and description from git diff and commits
version: 1.0.0
category: git
tags: [git, pull-request, documentation, collaboration]
author: Skills Marketplace
license: MIT
---

Write a pull request description for the current branch's changes.

Format:
```
## What

<1-3 sentence summary of what changed and why>

## Changes

- <bullet per meaningful change — not per commit, per logical change>

## Testing

<how to verify this works, or "N/A" if trivial>
```

Rules:
- Title: imperative mood, max 72 chars, describes the change not the ticket
- Be specific — mention the actual components, functions, or behaviors changed
- Don't repeat the diff — summarize the intent and impact
- If there are breaking changes or migration steps, add a "Breaking Changes" section
