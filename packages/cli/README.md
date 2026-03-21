# @iamramo/zanat-cli

CLI for Zanat - a skill hub for AI agents.

## Installation

```bash
npm install -g @iamramo/zanat-cli
```

## Usage

### Initialize

```bash
zanat init
```

This will interactively prompt you for:

- Hub repository URL (default: https://github.com/iamramo/zanat-hub.git)
- Hub branch (default: main, falls back to master if main doesn't exist)

### Sync with Hub

```bash
zanat sync
```

### Search Skills

```bash
zanat search [query]
```

### Add a Skill

```bash
zanat add <source>/<skill-name>
```

### List Installed Skills

```bash
zanat list
```

## Configuration

Configuration is stored in `~/.zanat/config.json` and is created during `zanat init`.

You can manually edit this file to change settings:

```json
{
  "hubUrl": "https://github.com/iamramo/zanat-hub.git",
  "hubBranch": "main"
}
```

## License

MIT
