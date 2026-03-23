# @iamramo/zanat-cli

CLI for Zanat - a skill hub for AI agents.

## Installation

```bash
npm install -g @iamramo/zanat-cli
```

## Commands

| Command  | Description                                                 | Usage                  |
| -------- | ----------------------------------------------------------- | ---------------------- |
| `init`   | Initialize zanat configuration and clone the hub repository | `zanat init`           |
| `pull`   | Pull the latest changes from the hub repository             | `zanat pull`           |
| `search` | Search for available skills in the hub                      | `zanat search [query]` |
| `add`    | Add a skill to your local skills                            | `zanat add <skill>`    |
| `rm`     | Remove a skill from your local skills                       | `zanat rm <skill>`     |
| `list`   | List all added skills                                       | `zanat list`           |
| `update` | Update skill(s) from hub                                    | `zanat update [skill]` |
| `status` | Show hub and skills status                                  | `zanat status`         |

## Getting Started

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

## Configuration

Configuration is stored in `~/.zanat/config.json`:

```json
{
  "hubUrl": "https://github.com/iamramo/zanat-hub.git",
  "hubBranch": "main"
}
```

## License

MIT
