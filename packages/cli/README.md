# @iamramo/zanat-cli

CLI for [Zanat](https://github.com/iamramo/zanat) — a skill hub for AI agents.

## Installation

```bash
npm install -g @iamramo/zanat-cli
```

Requires Node.js v22+ and Git.

## Commands

| Command                         | Description                                           |
| ------------------------------- | ----------------------------------------------------- |
| `zanat init`                    | Initialize configuration and clone the hub repository |
| `zanat pull`                    | Pull latest changes from the hub                      |
| `zanat add <skill>`             | Add a skill (tracks hub branch)                       |
| `zanat add <skill> --pin=<ref>` | Add a skill pinned to a tag or commit SHA             |
| `zanat rm <skill>`              | Remove a skill                                        |
| `zanat update [skill]`          | Update one or all skills from hub                     |
| `zanat list`                    | List added skills with version info                   |
| `zanat show <skill>`            | Show skill content                                    |
| `zanat search [query]`          | Search available skills in the hub                    |
| `zanat status`                  | Show hub and skills status                            |

## Version Tracking

By default, skills **track** the hub branch. They stay current when you run `zanat update`.

To lock a skill to a specific point in time, **pin** it to a tag or commit SHA:

```bash
zanat add vercel.frontend.react-patterns               # tracks hub branch
zanat add vercel.frontend.react-patterns --pin=v1.2.0  # pinned to tag
zanat add vercel.frontend.react-patterns --pin=abc1234 # pinned to commit
```

Pinned skills never auto-update. Re-add without `--pin` to resume tracking.

### Status Indicators

| Indicator          | Meaning                       |
| ------------------ | ----------------------------- |
| `abc1234 (main)`   | Tracking the hub branch       |
| `abc1234 (pinned)` | Pinned to a tag or commit SHA |

## Skill Format

Skills are markdown files with YAML frontmatter:

```markdown
---
name: code-review
description: Helps review code for quality and best practices
---

# Code Review

Instructions for the agent go here...
```

**Required:** `name`, `description`

**Optional:** `license`, `compatibility`, `disable-model-invocation`, `user-invocable`, `argument-hint`, `metadata`

Skill names must be lowercase with hyphens (e.g., `code-review`, `react-hooks`) and match the folder name.

## Configuration

Stored in `~/.zanat/config.json`:

```json
{
  "hubUrl": "git@github.com:iamramo/zanat-hub.git",
  "hubBranch": "main",
  "hubDir": "/Users/you/.zanat/hub",
  "lastPull": "2026-03-23T12:00:00.000Z"
}
```

## Troubleshooting

Enable debug mode for detailed error output:

```bash
zanat --debug <command>
```

**"Failed to initialize"** — Ensure Git is installed and you have access to the hub repository.

**"Failed to pull"** — Check the hub URL in `~/.zanat/config.json` and network connectivity.

**"Could not read the lock file"** — Run `zanat init` to create the initial configuration.

## License

MIT
