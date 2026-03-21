# Zanat

[![npm version](https://img.shields.io/npm/v/@iamramo/zanat-cli.svg)](https://www.npmjs.com/package/@iamramo/zanat-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A skill hub for AI agents. Store, version, and distribute agent skills using Git.

## What is Zanat?

Zanat is a CLI tool that lets you manage AI agent skills as versioned markdown files. Think of it as a package manager, but instead of code libraries, you manage instructions and guidelines that help AI agents perform specific tasks.

Skills are stored in a Git repository (the "hub"), discovered via search, and installed locally where your AI agents can access them.

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

## Quick Start

```bash
# Install the CLI globally
npm install -g @iamramo/zanat-cli

# Initialize zanat (clones the hub repository)
zanat init

# Search for available skills
zanat search react

# Add a skill to your local environment
zanat add yurchi.mobile.react-native

# List your installed skills
zanat list
```

## Namespace Structure

Zanat uses a dot-notation namespace system that maps to directory structures in the hub:

```
company.team.skill-name
```

**Examples:**

- `yurchi.code-review` → `hub/yurchi/code-review/SKILL.md`
- `company.frontend.react` → `hub/company/frontend/react/SKILL.md`
- `anthropic.prompt-engineering.system` → `hub/anthropic/prompt-engineering/system/SKILL.md`

This flexible structure allows for unlimited nesting to organize skills by company, team, category, or any hierarchy you need.

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

## Configuration

Configuration is stored in `~/.zanat/config.json`:

```json
{
  "hubUrl": "git@github.com:iamramo/zanat-hub.git",
  "hubBranch": "main"
}
```

## Creating Skills

Skills are markdown files with YAML frontmatter. See the [zanat-hub](https://github.com/iamramo/zanat-hub) repository for examples.

## License

MIT © Yurchi
