---
name: optimize
description: Identify and fix performance bottlenecks in the selected code
version: 1.0.0
category: performance
tags: [performance, optimization, profiling, memory]
author: Skills Marketplace
license: MIT
---

Analyze the selected code for performance issues and suggest optimizations.

Check for:
- **Algorithmic complexity** — O(n²) loops that could be O(n), redundant iterations
- **Unnecessary work** — repeated computations, missing memoization, eager loading
- **Memory pressure** — large allocations, leaks, excessive cloning/copying
- **I/O inefficiency** — N+1 queries, missing batching, unneeded network calls
- **React-specific** — missing keys, unnecessary re-renders, expensive operations in render

For each issue: describe the problem, explain the impact, and show the optimized version. Quantify improvements where possible (e.g., "O(n²) → O(n)"). Only suggest changes with meaningful impact — don't micro-optimize.
