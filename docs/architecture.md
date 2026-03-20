# Zanat Architecture

## Overview

Zanat follows a Git-backed, CLI-first architecture that scales from single-user to enterprise deployments.

## Components

### 1. CLI (Current - MVP)
- **Entry Point**: `src/cli.ts`
- **Commands**: `src/commands/`
- **Operations**: Git clone/pull, skill installation, search

### 2. Hub Repository (Git)
- **Location**: `~/.zanat/hub/`
- **Structure**: `sources/{source}/{skill}/SKILL.md`
- **Versioning**: Git commits
- **Sync**: Incremental pulls

### 3. Skill Registry (Future)
- **HTTP API**: REST endpoints
- **MCP Server**: Protocol interface for agents
- **Web UI**: Browse and manage skills

### 4. Local Installation
- **Target**: `~/.agents/skills/`
- **Format**: `zanat.{source}.{skill}/SKILL.md`
- **Tracking**: `.skill-lock.json`

## Data Flow

```
Git Repository (Hub)
       ↓
   zanat sync
       ↓
~/.zanat/hub/
       ↓
   zanat install
       ↓
~/.agents/skills/
       ↓
   Agent reads
```

## Future Scaling

### Phase 1: MVP (Current)
- CLI only
- Single hub source
- Git-based storage
- Grep search

### Phase 2: Enhanced CLI
- Multiple hub sources
- Version resolution
- SQLite search index
- Auto-sync on install

### Phase 3: MCP Server
- Protocol interface
- Agents query on-demand
- Real-time skill discovery

### Phase 4: Web UI
- Browser-based management
- Skill editor
- Visual dependency graph

### Phase 5: Enterprise
- Access control
- Audit logging
- Private hubs
- Team collaboration
