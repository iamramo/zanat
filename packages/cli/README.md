# @iamramo/zanat-cli

CLI for [Zanat](https://github.com/iamramo/zanat), a skill hub for AI agents.

## Installation

```bash
npm install -g @iamramo/zanat-cli
```

Requires Node.js v22+ and Git.

## Commands

| Command                         | Description                                             |
| ------------------------------- | ------------------------------------------------------- |
| `zanat hub add`                 | Add a new hub interactively                             |
| `zanat hub rm <name>`           | Remove a hub                                            |
| `zanat hub switch <name>`       | Switch the active hub                                   |
| `zanat hub list`                | List all configured hubs                                |
| `zanat hub pull`                | Pull latest changes from the hub                        |
| `zanat add [skill]`             | Add a skill, or all hub skills if no name is given      |
| `zanat add <skill> --pin=<ref>` | Add a skill pinned to a tag or commit SHA               |
| `zanat rm [skill]`              | Remove a skill, or all added skills if no name is given |
| `zanat update [skill]`          | Update one or all non-pinned skills from the hub        |
| `zanat list`                    | List added skills with version info                     |
| `zanat show <skill>`            | Show the full content of a skill                        |
| `zanat search [query]`          | Search available skills in the hub                      |
| `zanat status`                  | Show hub and skills status                              |

## Version Tracking

By default, skills track the hub branch and stay current when you run `zanat update`.

To lock a skill to a specific point in time, pin it to a tag or commit SHA:

```bash
zanat add vercel.frontend.react-patterns               # tracks hub branch
zanat add vercel.frontend.react-patterns --pin=v1.2.0  # pinned to tag
zanat add vercel.frontend.react-patterns --pin=abc1234 # pinned to commit
```

Pinned skills never auto-update. Re-add without `--pin` to resume tracking.

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

Skill names must be lowercase with hyphens (e.g. `code-review`, `react-hooks`) and match the folder name.

## Configuration

Stored in `~/.zanat/config.json`:

```json
{
  "version": 1,
  "activeHub": "default",
  "hubs": {
    "default": {
      "url": "git@github.com:you/your-skills-hub.git",
      "branch": "main",
      "dir": "/Users/you/.zanat/hubs/default",
      "lastPull": "2026-03-23T12:00:00.000Z"
    }
  }
}
```

## Troubleshooting

Enable debug mode for detailed error output:

```bash
zanat --debug <command>
```

**"Failed to initialize"** Ensure Git is installed and you have access to the hub repository.

**"Failed to pull"** Check the hub URL in `~/.zanat/config.json` and network connectivity.

**"Could not read the lock file"** Run `zanat hub add` to create the initial configuration.

## License

MIT
