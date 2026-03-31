import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AgentSkill, LockFile, Zod } from '@iamramo/zanat-core';
import { text, error } from '../response.js';

export function registerRemove(server: McpServer): void {
  server.registerTool(
    'remove_skill',
    {
      description: 'Remove an installed skill.',
      inputSchema: { fullName: Zod.skill.FullSchema.shape.fullName },
    },
    async ({ fullName }) => {
      try {
        const lockEntry = await LockFile.find(fullName);
        if (!lockEntry) {
          return text(`Skill '${fullName}' is not installed.`);
        }

        await AgentSkill.remove(fullName);

        return text(`Skill '${fullName}' has been removed.`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return error(`Error removing skill: ${message}`);
      }
    }
  );
}
