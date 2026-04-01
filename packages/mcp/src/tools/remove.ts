import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AgentSkill, LockFile, Zod } from '@iamramo/zanat-core';
import { text, error } from '../response.js';

export function registerRemove(server: McpServer): void {
  server.registerTool(
    'remove_skill',
    {
      description: 'Remove an added skill. Omit skill_name to remove all added skills.',
      inputSchema: { fullName: Zod.skill.FullSchema.shape.fullName.optional() },
    },
    async ({ fullName }) => {
      try {
        // Bulk-remove: no skill name provided
        if (fullName === undefined) {
          const lockFileSkills = await LockFile.findAll();
          const skillNames = Object.keys(lockFileSkills);

          if (skillNames.length === 0) {
            return text('No skills added.');
          }

          for (const name of skillNames) {
            await AgentSkill.remove(name);
          }

          return text(`Removed ${skillNames.length} skill(s): ${skillNames.join(', ')}`);
        }

        // Single-skill remove
        const lockEntry = await LockFile.find(fullName);
        if (!lockEntry) {
          return text(`Skill '${fullName}' is not added.`);
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
