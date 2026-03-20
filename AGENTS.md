# Zanat - Context for AI Agents

This file provides context about the Zanat project for future AI agents.

## Project Overview

**Zanat** is a skill hub for AI agents. It allows users to:
- Store skills as markdown files with YAML frontmatter
- Version skills using Git
- Install skills locally to `~/.agents/skills/`
- Search and discover skills

## Key Decisions

### Naming Convention
Skills are installed with the format: `zanat.<source>.<skill-name>`

Examples:
- `zanat.yurchi.code-review` - Skills authored by Yurchi
- `zanat.vercel.pr-review` - Vercel skills installed via Zanat
- `zanat.anthropic.web-accessibility` - Anthropic skills via Zanat

This prevents conflicts with other skill managers (like npx skills).

### Directory Structure

**Hub (Git Repository):**
```
~/.zanat/hub/
└── sources/
    ├── yurchi/
    │   └── code-review/
    │       └── SKILL.md
    ├── vercel/
    │   └── pr-review/
    │       └── SKILL.md
    └── anthropic/
        └── web-accessibility/
            └── SKILL.md
```

**Installed Skills:**
```
~/.agents/
├── .skill-lock.json
└── skills/
    ├── zanat.yurchi.code-review/
    │   └── SKILL.md
    └── zanat.vercel.pr-review/
        └── SKILL.md
```

### Skill Format

```markdown
---
id: code-review
name: Code Review
description: Helps review code for quality and best practices
author: yurchi
version: 1.0.0
tags: [review, quality, best-practices]
---

# Code Review

Instructions for the agent go here...
```

### Storage Approach

**Git as Source of Truth:**
- Skills stored in a Git repository
- Versions tracked via Git commits
- Users can specify exact versions by commit SHA or use `latest`
- Incremental indexing (only changed files on sync)

**SQLite Cache (Future):**
- For fast search and indexing
- Rebuilt on sync
- Content remains in Git

### MCP Server (Future)

Planned but not part of MVP:
- MCP (Model Context Protocol) interface
- Agents can query skills on-demand
- HTTP API for web UI

### CLI Commands

```bash
zanat init                    # Create ~/.zanat/, clone hub repo
zanat sync                    # Pull latest hub changes  
zanat install <source>/<skill> # Install skill
zanat list                    # List installed skills
zanat search [query]          # Search available skills
```

### Tech Stack

- **Language:** TypeScript
- **CLI:** Commander.js
- **Git:** simple-git library
- **Frontmatter:** gray-matter

- **Build:** TypeScript compiler (tsc)
- **Dev Server:** tsx (watch mode)

### MVP Scope

**Included:**
- Git-based skill storage
- CLI for init, sync, install, list, search
- Local skill installation to `~/.agents/skills/`
- Basic full-text search (grep-based)

**Not Included (Future):**
- MCP server
- HTTP API
- Web UI
- Multiple hub sources
- Version resolution (only latest for MVP)
- Database/search index (SQLite)
- PR workflow automation

### Philosophy

- **Git-native:** Leverage Git for versioning and collaboration
- **Standard directories:** Use `~/.agents/skills/` for compatibility
- **Namespace collision prevention:** Always prefix with `zanat.<source>.`
- **Incremental:** Start simple, add complexity as needed

## Repository

- GitHub: iamramo/zanat (will move to yurchi/zanat)
- npm: zanat (unscoped, available)

## Development Guidelines

### Git Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

**Format:** `<type>[scope]: <description>`

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting (no logic change)
- `refactor` - Code refactoring
- `perf` - Performance
- `test` - Tests
- `build` - Build/dependencies
- `ci` - CI changes
- `chore` - Maintenance

**Examples:**
```
feat(cli): add search command
fix(install): handle missing skill directory
docs: update README with examples
refactor: extract path utilities
```

**Breaking changes:** Use `!` after type: `feat!: change config format`

**Rules:**
- Present tense, imperative mood: "add" not "added"
- Keep description under 72 characters
- One logical change per commit

## License

MIT
