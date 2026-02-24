---
name: test
description: Generate comprehensive unit tests for the selected code
---


Write tests for the selected code.

Cover:
- **Happy path** — normal inputs produce expected outputs
- **Edge cases** — empty values, boundaries, large inputs, special characters
- **Error cases** — invalid inputs, missing dependencies, thrown exceptions
- **Side effects** — mutations, async behavior, external calls (mock them)

Use the testing framework already present in the project. Follow existing test file conventions (naming, structure, assertion style). Each test should have a clear description of what it's verifying. Avoid testing implementation details — test behavior.
