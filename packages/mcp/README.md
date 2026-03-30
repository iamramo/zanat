# @iamramo/zanat-mcp

MCP (Model Context Protocol) server for [Zanat](https://github.com/iamramo/zanat) — a skill hub for AI agents.

## Usage

Configure it in your AI tool's MCP settings:

```json
{
  "mcpServers": {
    "zanat": {
      "command": "npx",
      "args": ["@iamramo/zanat-mcp"]
    }
  }
}
```

Requires Node.js v22+, Git, and a configured Zanat hub (`zanat init`).

## Tools

| Tool            | Description                                        |
| --------------- | -------------------------------------------------- |
| `search_skills` | Search for skills in the hub by name or content    |
| `list_skills`   | List installed skills with version and pin status  |
| `get_skill`     | Get the full content of a skill                    |
| `add_skill`     | Install a skill, optionally pinned to a tag or SHA |
| `update_skill`  | Update one or all non-pinned skills from the hub   |
| `remove_skill`  | Remove an installed skill                          |

## License

MIT
