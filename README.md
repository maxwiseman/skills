# skills

A marketplace of [Claude Code](https://claude.ai/code) skills and plugins. Browse, preview, and install skills to enhance your Claude Code development workflow.

Skills are organized into plugins — each plugin contains one or more skills. You can add this marketplace to Claude Code with:

```
/plugin marketplace add max-skills
```

## Skills

| Plugin | Description | Category |
|--------|-------------|----------|
| `commit` | Generate a conventional commit message from staged changes | git |
| `debug` | Systematically diagnose and fix errors, exceptions, and unexpected behavior | debugging |
| `explain` | Explain what a piece of code does in plain language | documentation |
| `optimize` | Identify and fix performance bottlenecks in the selected code | performance |
| `pr-description` | Write a clear pull request title and description from git diff and commits | git |
| `refactor` | Refactor selected code for clarity, maintainability, and idiomatic style | quality |
| `release` | Prepare and publish a new version release with changelog and git tags | git |
| `review` | Review code for bugs, security vulnerabilities, and performance issues | quality |
| `test` | Generate comprehensive unit tests for the selected code | testing |
| `typst-author` | Generate, edit, and answer questions about Typst (`.typ`) files | documentation |

## Tech Stack

- **Next.js** - Web application framework
- **TailwindCSS** - Utility-first CSS
- **shadcn/ui** - Reusable UI components
- **Drizzle** - TypeScript-first ORM
- **PostgreSQL** - Database
- **Better-Auth** - Authentication
- **Turborepo** - Monorepo build system

## Getting Started

Install dependencies:

```bash
bun install
```

Set up your environment variables in `apps/web/.env`:

```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
```

Push the database schema:

```bash
bun run db:push
```

Start the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Adding a Plugin

1. Create a new directory under `apps/web/skills/<plugin-slug>/`
2. Add a `metadata.ts` file describing the plugin
3. Add one or more skills under `apps/web/skills/<plugin-slug>/skills/<skill-slug>/SKILL.md`
4. Register the plugin in `apps/web/src/plugins/registry.ts`

## Project Structure

```
skills/
├── apps/
│   └── web/                    # Next.js marketplace app
│       ├── skills/             # Plugin and skill definitions
│       └── src/
│           ├── app/            # Next.js App Router pages
│           ├── components/     # UI components
│           └── plugins/        # Plugin registry
└── packages/
    ├── auth/                   # Authentication configuration
    ├── config/                 # Shared TypeScript/tooling config
    ├── db/                     # Database schema & queries
    └── env/                    # Environment variable validation
```

## Available Scripts

- `bun run dev` — Start the development server
- `bun run build` — Build for production
- `bun run check-types` — Type-check all packages
- `bun run db:push` — Push schema changes to the database
- `bun run db:generate` — Generate database types
- `bun run db:migrate` — Run database migrations
- `bun run db:studio` — Open Drizzle Studio
- `bun run check` — Lint and format check
- `bun run fix` — Auto-fix lint and formatting issues
