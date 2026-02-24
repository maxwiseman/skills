---
name: commit
description: Generate a conventional commit message from staged changes
---


Look at the staged git diff and write a conventional commit message.

Format:
```
<type>(<scope>): <short summary>

<optional body — wrap at 72 chars>
```

Types: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `chore`, `ci`

Rules:
- Summary is imperative mood, lowercase, no period, max 72 chars
- Include a body only if the why isn't obvious from the summary
- If there are breaking changes, note them clearly

Output only the commit message — no explanation, no quotes.
