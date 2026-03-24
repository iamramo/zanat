# @iamramo/zanat-cli

CLI for Zanat - a skill hub for AI agents.

## Installation

```bash
npm install -g @iamramo/zanat-cli
```

## Quick Start

1. **Initialize zanat:**

   ```bash
   zanat init
   ```

   This will prompt you for the hub repository URL and branch.

2. **Search for skills:**

   ```bash
   zanat search code-review
   ```

3. **Add a skill:**

   ```bash
   zanat add yurchi.code-review
   ```

   You can also use nested namespaces:

   ```bash
   zanat add company.team.code-review
   ```

4. **List added skills:**

   ```bash
   zanat list
   ```

5. **Update skills:**

   ```bash
   # Update a specific skill
   zanat update yurchi.code-review

   # Update all skills
   zanat update
   ```

6. **Check status:**

   ```bash
   zanat status
   ```

7. **Remove a skill:**

   ```bash
   zanat rm yurchi.code-review
   ```

## Quick Reference

| Command                           | Description                                                    |
| --------------------------------- | -------------------------------------------------------------- |
| `zanat init`                      | Initialize zanat configuration and clone the hub repository    |
| `zanat pull`                      | Pull the latest changes from the hub repository                |
| `zanat search [query]`            | Search for available skills in the hub                         |
| `zanat add <skill>`               | Add a skill (tracks hub branch by default)                     |
| `zanat add <skill> --pin=<ref>`   | Add a skill pinned to a specific branch, tag, or commit        |
| `zanat rm <skill>`                | Remove a skill from your local skills                          |
| `zanat list`                      | List all added skills with version info                        |
| `zanat update [skill]`            | Update skill(s) from hub                                       |
| `zanat status`                    | Show hub and skills status                                     |

## Version Tracking

Zanat uses a dual-reference tracking system that distinguishes between what you asked for and what was actually resolved:

- **requestedRef**: The branch, tag, or commit you specified (e.g., `main`, `v1.2.0`, `abc1234`)
- **resolvedCommit**: The actual commit SHA that was resolved from the requested ref

### Tracking vs Pinning

**Tracking (default)**: Skills track the hub branch for automatic updates

```bash
zanat add vercel.frontend.react-patterns
# Tracks main branch, updates with 'zanat update'
```

**Pinning**: Lock a skill to a specific version that never auto-updates

```bash
# Pin to a branch (follows branch updates but not hub branch)
zanat add vercel.frontend.react-patterns --pin=develop

# Pin to a tag (never updates)
zanat add vercel.frontend.react-patterns --pin=v1.2.0

# Pin to a specific commit (never updates)
zanat add vercel.frontend.react-patterns --pin=abc1234
```

### Reference Status

Skills can have three reference states:

- **✓ ok**: The requested ref exists and resolves to a commit
- **⚠ orphaned**: The ref (branch/tag) no longer exists, but the commit is preserved
- **✗ broken**: Neither the ref nor the commit exist (skill files remain but can't update)

Check status with:

```bash
zanat list          # Shows ref status in version column
zanat status        # Detailed status for all skills
zanat update        # Warns about orphaned/broken skills before updating
```

### Fixing Orphaned Skills

If a skill becomes orphaned (the branch was deleted), re-pin it to the hub branch:

```bash
zanat add vercel.frontend.react-patterns
# Re-adds without --pin, which tracks the hub branch
```

## Configuration

Configuration is stored in `~/.zanat/config.json`:

```json
{
  "hubUrl": "git@github.com:iamramo/zanat-hub.git",
  "hubBranch": "main",
  "hubDir": "/Users/you/.zanat/hub",
  "lastPull": "2026-03-23T12:00:00.000Z"
}
```

## Troubleshooting

### Enable Debug Mode

If you encounter errors, enable debug mode to see detailed error information:

```bash
zanat --debug status
# or
zanat status --debug
```

This outputs the full error details in JSON format, helpful for debugging issues.

### Common Issues

**"Failed to initialize"**

- Ensure Git is installed and accessible in your PATH
- Check that you have permission to clone the hub repository

**"Failed to pull"**

- Verify your hub repository URL is correct in `~/.zanat/config.json`
- Check network connectivity to the Git host

**"Could not read the lock file"**

- Run `zanat init` to create the initial configuration

## License

MIT
