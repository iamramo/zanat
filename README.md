# Zanat

A skill hub for AI agents - manage and distribute agent skills.

## What is Zanat?

Zanat is a Git-backed skill registry that allows individuals, teams, and companies to manage AI agent skills together. It serves as a hub where skills can be discovered, installed, and versioned.

## Quick Start

```bash
# Install globally
npm install -g zanat

# Initialize (creates ~/.zanat/)
zanat init

# Sync with the hub
zanat sync

# Install a skill
zanat install yurchi/code-review

# List installed skills
zanat list
```

## Documentation

- [Architecture](./docs/architecture.md)
- [Creating Skills](./docs/creating-skills.md)
- [MCP Server](./docs/mcp-server.md) (Coming soon)

## License

MIT
