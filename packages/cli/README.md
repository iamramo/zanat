# @iamramo/zanat-cli

CLI for Zanat - a skill hub for AI agents.

## Installation

```bash
npm install -g @iamramo/zanat-cli
```

## Commands

| Command  | Description                                                 | Usage                                |
| -------- | ----------------------------------------------------------- | ------------------------------------ |
| `init`   | Initialize zanat configuration and clone the hub repository | `zanat init`                         |
| `sync`   | Sync with the hub to get latest skills                      | `zanat sync`                         |
| `search` | Search for available skills in the hub                      | `zanat search [query]`               |
| `add`    | Add a skill to your local installation                      | `zanat add <source>/<skill-name>`    |
| `remove` | Remove an installed skill                                   | `zanat remove <source>/<skill-name>` |
| `list`   | List all installed skills                                   | `zanat list`                         |

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
   zanat add yurchi/code-review
   ```

4. **Remove a skill:**

   ```bash
   zanat remove yurchi/code-review
   ```

5. **List installed skills:**
   ```bash
   zanat list
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
