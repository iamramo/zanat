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

## Table of Contents

- [What is Zanat?](#what-is-zanat)
- [Why Zanat?](#why-zanat)
- [Features](#features)
- [Quick Start](#quick-start)
- [How It Works](#how-it-works)
- [Prerequisites](#prerequisites)
- [Namespace Structure](#namespace-structure)
- [Creating Skills](#creating-skills)
- [Project Structure](#project-structure)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## What is Zanat?

Zanat is a CLI tool that manages AI agent skills as versioned markdown files stored in Git. Skills are instructions, guidelines, and context that help AI agents perform specific tasks better.

Instead of copy-pasting prompts into every chat, you define skills once in a Git repository, version them, and distribute them to your agents. Your AI tools (like Claude, Cursor, or custom agents) can then reference these skills to maintain consistency and quality across projects.

## Why Zanat?

**Version Control for Prompts**
Skills evolve. Track changes, roll back to previous versions, and collaborate with your team using Git workflows.

**Discoverability**
Search your entire skill library with `zanat search`. No more hunting through folders for that perfect prompt.

**Consistency**
Define your team's coding standards, review guidelines, or architectural decisions once. Every agent uses the same instructions.

**Flexibility**
Use any Git repository as your skill hub. Company wiki, private repo, or open source - it's up to you.

## Features

- 📦 **Git-based storage** - Skills are just markdown files with YAML frontmatter
- 🔍 **Full-text search** - Find skills by name or content
- 🏷️ **Namespace support** - Organize with `company.team.skill-name` structure
- 🔄 **Version management** - Track which skills are installed and their versions
- 🔌 **Standard directories** - Installs to `~/.agents/skills/` for agent compatibility
- 🐛 **Debug mode** - Use `ZANAT_DEBUG=true` for detailed error information

## Quick Start

```bash
# Install the CLI globally
npm install -g @iamramo/zanat-cli

# Initialize zanat (clones the hub repository)
zanat init

# Search for available skills
zanat search react

# Add a skill to your local environment
zanat add vercel.frontend.react-patterns

# List your installed skills with versions
zanat list

# Update skills to latest version
zanat update

# Check status
zanat status
```

For detailed command documentation, version tracking details, and troubleshooting, see the [CLI README](./packages/cli/README.md).

## How It Works

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────────┐
│   Git Hub       │────▶│  Zanat CLI   │────▶│  ~/.agents/skills/  │
│   (skills repo) │     │  (search/add)│     │  (local skills)     │
└─────────────────┘     └──────────────┘     └─────────────────────┘
```

1. **Hub** - A Git repository containing skills organized by namespace
2. **CLI** - Search, add, and manage skills from your terminal
3. **Local Skills** - Skills installed to `~/.agents/skills/` where AI agents can read them

## Prerequisites

- **Node.js**: v22.0.0 or higher
- **Git**: Required for cloning and pulling the hub repository
- **npm**: For installing the CLI

## Namespace Structure

Zanat uses a dot-notation namespace system that maps to directory structures in the hub:

```
company.team.skill-name
```

**Examples:**

- `code-review` → `hub/code-review/SKILL.md` (simple flat structure)
- `anthropic.code-review` → `hub/anthropic/code-review/SKILL.md` (single namespace)
- `vercel.frontend.react` → `hub/vercel/frontend/react/SKILL.md` (nested namespace)
- `google.cloud.security.best-practices` → `hub/google/cloud/security/best-practices/SKILL.md` (deep nesting)

This flexible structure allows for unlimited nesting to organize skills by company, team, category, or any hierarchy you need.

## Creating Skills

Skills are markdown files with YAML frontmatter. Create them in your hub repository:

```markdown
---
name: code-review
description: Helps review code for quality and best practices
---

# Code Review

When reviewing code, check for:

1. **Correctness** - Does it work as intended?
2. **Readability** - Is it easy to understand?
3. **Performance** - Are there obvious inefficiencies?
4. **Security** - Any common vulnerabilities?

Provide specific, actionable feedback. Suggest improvements with code examples when helpful.
```

**Required fields:** `name`, `description`

**Optional fields:**

- `license` - SPDX license identifier
- `compatibility` - Compatible agent versions
- `disable-model-invocation` - Set to true to disable tool use
- `user-invocable` - Can users directly invoke this skill
- `argument-hint` - Help text for arguments
- `metadata` - Custom key-value pairs

**Naming Requirements:**

- Skill names must be lowercase with hyphens (e.g., `code-review`, `react-hooks`)
- Names must match the folder name
- Namespaced format: `skill-name`, `namespace.skill-name`, or `organization.team.skill-name`

See the [zanat-hub](https://github.com/iamramo/zanat-hub) repository for examples.

## Project Structure

This is a monorepo containing:

| Package                            | Description                       |
| ---------------------------------- | --------------------------------- |
| [`packages/cli`](./packages/cli)   | The CLI tool (`zanat` command)    |
| [`packages/core`](./packages/core) | Core library for skill management |

## Development

```bash
# Clone the repository
git clone git@github.com:iamramo/zanat.git
cd zanat

# Install dependencies
npm install

# Build all packages
npm run build

# Run CLI locally
node packages/cli/dist/cli.js --help
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT © Yurchi
