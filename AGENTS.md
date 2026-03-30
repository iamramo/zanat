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

Skills are added with the format: `<namespace>.<skill-name>`

Namespace can be nested (e.g., `company-c.platform.devops`).

Examples:

- `zanat.yurchi.code-review` - Skills authored by Yurchi
- `zanat.vercel.pr-review` - Vercel skills added via Zanat
- `zanat.anthropic.web-accessibility` - Anthropic skills via Zanat
- `company-c.platform.devops` - Nested namespace skill

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
├── .zanat-lock.json
└── skills/
    ├── zanat.yurchi.code-review/
    │   └── SKILL.md
    └── zanat.vercel.pr-review/
        └── SKILL.md
```

### Skill Format

```markdown
---
name: code-review
description: Helps review code for quality and best practices
---

# Code Review

Instructions for the agent go here...
```

**Required fields:** `name`, `description`

**Optional fields:** `license`, `compatibility`, `disable-model-invocation`, `user-invocable`, `argument-hint`, `metadata`

### Storage Approach

**Git as Source of Truth:**

- Skills stored in a Git repository
- Versions tracked via Git commits
- Dual-reference system: `requestedRef` (branch/tag/commit) + `resolvedCommit` (actual SHA)
- Skills track hub branch by default; use `--pin=<ref>` to lock to specific version
- Incremental indexing (only changed files on pull)

**SQLite Cache (Future):**

- For fast search and indexing
- Rebuilt on pull
- Content remains in Git

### MCP Server

Standalone package (`@iamramo/zanat-mcp`) providing an MCP (Model Context Protocol) interface:

- Agents can query, install, update, and remove skills via MCP tools
- Communicates over stdio (JSON-RPC)
- Run via `npx @iamramo/zanat-mcp`

### CLI Commands

```bash
zanat init                    # Create ~/.zanat/, clone hub repo
zanat pull                    # Pull latest hub changes
zanat add <skill>             # Add skill (tracks hub branch)
zanat add <skill> --pin=<ref> # Add skill pinned to specific tag or commit SHA
zanat rm <skill>              # Remove a skill
zanat update [skill]          # Update skill(s) from hub
zanat list                    # List added skills
zanat status                  # Show hub and skills status
zanat search [query]          # Search available skills
```

### Version Tracking

Zanat uses a dual-reference tracking system:

- **requestedRef**: The branch, tag, or commit requested by the user
- **resolvedCommit**: The actual commit SHA resolved from the requested ref

**Tracking (default):** Skills track the hub branch and auto-update with `zanat pull`
**Pinning:** Use `--pin=<ref>` to lock a skill to a specific tag or commit SHA. Branch pinning is not supported.

### Tech Stack

- **Language:** TypeScript
- **CLI:** Commander.js
- **MCP:** @modelcontextprotocol/sdk
- **Git:** simple-git library
- **Frontmatter:** gray-matter

- **Build:** TypeScript compiler (tsc)
- **Dev Server:** tsx (watch mode)

### MVP Scope

**Included:**

- Git-based skill storage
- CLI for init, pull, add, rm, update, list, status, search
- MCP server for AI agent integration (`@iamramo/zanat-mcp`)
- Local skill add to `~/.agents/skills/`
- Basic full-text search (grep-based)
- Dual-reference version tracking (track hub branch or pin to specific ref)

**Not Included (Future):**

- HTTP API
- Web UI
- Multiple hub sources
- Database/search index (SQLite)
- PR workflow automation

### Philosophy

- **Git-native:** Leverage Git for versioning and collaboration
- **Standard directories:** Use `~/.agents/skills/` for compatibility
- **Namespace collision prevention:** Always prefix with `zanat.<source>.`
- **Incremental:** Start simple, add complexity as needed

### Code Style

**Import Ordering:**
Import order matters for consistency. Follow this pattern:

1. Node built-ins (e.g., `node:path`, `node:os`)
2. External dependencies (e.g., `commander`, `chalk`, `zod`)
3. Local/core imports (e.g., `@iamramo/zanat-core`)
4. Relative imports (e.g., `./schemas/skill-arg.js`)

**Output Formatting:**
Use inline `\n` for newlines instead of separate `console.log()` calls.

**Error Handling:**
Use the logger abstraction for all output. Don't call `console.log()` or `console.error()` directly in commands.

## Repository

- GitHub: iamramo/zanat (will move to yurchi/zanat)
- npm: @iamramo/zanat-cli, @iamramo/zanat-mcp

## License

MIT
