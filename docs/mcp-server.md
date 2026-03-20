# MCP Server (Future)

This document outlines the planned MCP (Model Context Protocol) server implementation.

## Status: Not Implemented

The MCP server is planned for Phase 3, after the CLI MVP is complete.

## Overview

The MCP server will provide a protocol interface that allows AI agents to:
- Discover available skills
- Read skill content on-demand
- Search skills by keywords/tags
- Get skill metadata

## Planned Endpoints

### Resources
- `resources/list` - List all available skills
- `resources/read` - Read a specific skill by ID
- `resources/search` - Search skills by query

### Tools
- `tools/install` - Install a skill locally
- `tools/update` - Update installed skills
- `tools/list-installed` - List locally installed skills

## Use Case

Agents using the MCP protocol (like Claude, Cursor, etc.) can:

1. Query the hub for relevant skills based on user task
2. Install skills dynamically
3. Read skill instructions to enhance responses

## Implementation Notes

- Will reuse the same Git-backed storage
- Can run alongside CLI (different processes)
- Stateless design (reads from Git/FS)
- Optional authentication for private hubs

## Example Flow

```
User: "Help me review this code"
Agent → MCP: resources/search "code review"
MCP → Agent: [list of review skills]
Agent → MCP: resources/read "zanat.yurchi.code-review"
MCP → Agent: {skill content}
Agent: Uses skill instructions to review code
```
