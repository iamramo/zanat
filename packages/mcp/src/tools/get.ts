import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { HubSkill, LockFile, Zod } from '@iamramo/zanat-core';
import { text, json } from '../response.js';

export function registerGet(server: McpServer): void {
  server.registerTool(
    'get_skill',
    {
      description: 'Get the full content of a specific skill by its full name (e.g. "vercel.react-patterns"). Returns the skill frontmatter and markdown content.',
      inputSchema: { fullName: Zod.skill.FullSchema.shape.fullName },
    },
    async ({ fullName }) => {
      try {
        const skill = await HubSkill.find(fullName);
        if (!skill) {
          return text(`Skill '${fullName}' not found in hub.`);
        }

        const lockFileSkills = await LockFile.findAll().catch(() => ({}));

        return json({
          fullName: skill.fullName,
          name: skill.name,
          description: skill.description,
          content: skill.content,
          installed: skill.fullName in lockFileSkills,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return text(`Error getting skill: ${message}`);
      }
    }
  );
}
