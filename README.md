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

## Configuration

Zanat can be configured using environment variables. Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

### Environment Variables

| Variable           | Description                                      | Default                                    |
| ------------------ | ------------------------------------------------ | ------------------------------------------ |
| `ZANAT_HUB_URL`    | URL of the zanat hub repository                  | `https://github.com/iamramo/zanat-hub.git` |
| `ZANAT_HUB_BRANCH` | Branch to use from the hub                       | `main`                                     |
| `NODE_ENV`         | Environment mode (`development` or `production`) | `development`                              |
| `DEBUG`            | Enable debug logging                             | `false`                                    |

## Documentation

- [Architecture](./docs/architecture.md)
- [Creating Skills](./docs/creating-skills.md)
- [MCP Server](./docs/mcp-server.md) (Coming soon)

## License

MIT
