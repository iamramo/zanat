import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { HubSkill, LockFile, Zod } from '@iamramo/zanat-core';
import { json, error } from '../response.js';

export function registerSearch(server: McpServer): void {
  server.registerTool(
    'search_skills',
    {
      description:
        'Search for skills available in the hub. Returns matching skills with name, description, and add status. If no query is provided, returns all available skills.',
      inputSchema: {
        query: Zod.z
          .string()
          .optional()
          .describe('Search query to filter skills by name, description, or content'),
      },
    },
    async ({ query }) => {
      try {
        const skills = query?.trim()
          ? await HubSkill.search(query.trim())
          : await HubSkill.findAll();

        const lockFileSkills = await LockFile.findAll().catch(() => ({}));

        const results = skills.map((skill) => ({
          fullName: skill.fullName,
          name: skill.name,
          description: skill.description,
          added: skill.fullName in lockFileSkills,
        }));

        return json(results);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return error(`Error searching skills: ${message}`);
      }
    }
  );
}
