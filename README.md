<h1 align="center">Zanat</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/@iamramo/zanat-cli">
    <img src="https://img.shields.io/npm/v/@iamramo/zanat-cli.svg" alt="npm version">
  </a>
  <a href="https://www.npmjs.com/package/@iamramo/zanat-cli">
    <img src="https://img.shields.io/npm/dm/@iamramo/zanat-cli.svg" alt="npm downloads">
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
  </a>
</p>

<p align="center">
  <strong>Your personal skill library from any Git repository.</strong>
</p>

## What is Zanat?

Zanat manages AI agent skills as versioned markdown files in Git. Define instructions once, version them, and distribute them to any AI tool — Claude, Cursor, OpenCode, or custom agents.

- **Version-controlled prompts** — Track changes, roll back, collaborate via Git
- **Searchable** — Find skills across your entire library from the terminal
- **Consistent** — Every agent uses the same instructions
- **Flexible** — Any Git repository can be a skill hub

## Quick Start

```bash
# Install
npm install -g @iamramo/zanat-cli

# Initialize (clones your hub repository)
zanat init

# Search, add, and use skills
zanat search react
zanat add vercel.frontend.react-patterns
zanat list
```

See the [CLI documentation](./packages/cli/README.md) for the full command reference.

## How It Works

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────────┐
│   Git Hub       │────>│  Zanat CLI   │────>│  ~/.agents/skills/  │
│   (skills repo) │     │  (search/add)│     │  (local skills)     │
└─────────────────┘     └──────────────┘     └─────────────────────┘
```

1. **Hub** — A Git repository containing skills organized by namespace
2. **CLI** — Search, add, and manage skills from your terminal
3. **Local** — Skills install to `~/.agents/skills/` where agents can read them

## Namespaces

Skills use dot-notation namespaces that map to directories in the hub:

```
anthropic.code-review       → hub/anthropic/code-review/SKILL.md
vercel.frontend.react       → hub/vercel/frontend/react/SKILL.md
```

Namespaces can be nested to any depth — organize by company, team, category, or whatever fits.

## Creating Skills

Skills are markdown files with YAML frontmatter, stored in your hub repository:

```markdown
---
name: code-review
description: Helps review code for quality and best practices
---

# Code Review

When reviewing code, check for:

1. Correctness — Does it work as intended?
2. Readability — Is it easy to understand?
3. Performance — Are there obvious inefficiencies?
```

See the [zanat-hub](https://github.com/iamramo/zanat-hub) for examples and the [CLI README](./packages/cli/README.md) for the full skill format reference.

## MCP Server

Zanat includes an MCP (Model Context Protocol) server, allowing AI agents to search, install, update, and remove skills programmatically.

```bash
zanat mcp
```

Configure it in your AI tool's MCP settings:

```json
{
  "mcpServers": {
    "zanat": {
      "command": "zanat",
      "args": ["mcp"]
    }
  }
}
```

### Available Tools

| Tool             | Description                                          |
| ---------------- | ---------------------------------------------------- |
| `search_skills`  | Search for skills in the hub by name or content      |
| `list_skills`    | List installed skills with version and pin status    |
| `get_skill`      | Get the full content of a skill                      |
| `add_skill`      | Install a skill, optionally pinned to a tag or SHA   |
| `update_skill`   | Update one or all non-pinned skills from the hub     |
| `remove_skill`   | Remove an installed skill                            |

## Project Structure

| Package                            | Description                |
| ---------------------------------- | -------------------------- |
| [`packages/cli`](./packages/cli)   | CLI tool (`zanat` command) |
| [`packages/core`](./packages/core) | Core library               |

## Development

```bash
git clone git@github.com:iamramo/zanat.git
cd zanat
npm install
npm run build
```

## Contributing

Contributions welcome. Please open an issue first for major changes.

## License

MIT
