import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AgentSkill, LockFile, Git, Zod } from '@iamramo/zanat-core';
import { text, json, error } from '../response.js';

export function registerUpdate(server: McpServer): void {
  server.registerTool(
    'update_skill',
    {
      description:
        'Update skill(s) from the hub. If a skill name is provided, updates that skill. Otherwise, updates all non-pinned skills. Pinned skills are always skipped.',
      inputSchema: {
        fullName: Zod.z
          .string()
          .optional()
          .describe(
            'Full skill name to update (e.g. "vercel.react-patterns"). If omitted, updates all non-pinned skills.'
          ),
      },
    },
    async ({ fullName }) => {
      try {
        if (fullName) {
          Zod.skill.FullSchema.shape.fullName.parse(fullName);

          const lockEntry = await LockFile.find(fullName);
          if (!lockEntry) {
            return text(`Skill '${fullName}' is not added.`);
          }

          if (await LockFile.isPinned(fullName)) {
            return text(`Skill '${fullName}' is pinned and will not be updated.`);
          }

          await Git.pull();
          await AgentSkill.update(fullName);
          return text(`Skill '${fullName}' has been updated.`);
        }

        // Update all non-pinned skills
        const skills = await LockFile.findAll();
        const entries = Object.entries(skills);

        if (entries.length === 0) {
          return text('No skills added.');
        }

        const pinned: string[] = [];
        const updatable: string[] = [];

        for (const [name] of entries) {
          if (await LockFile.isPinned(name)) {
            pinned.push(name);
          } else {
            updatable.push(name);
          }
        }

        if (updatable.length === 0) {
          return text('No updatable skills. All added skills are pinned.');
        }

        await Git.pull();

        for (const name of updatable) {
          await AgentSkill.update(name);
        }

        const result: Record<string, string[]> = { updated: updatable };
        if (pinned.length > 0) result.skipped_pinned = pinned;

        return json(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return error(`Error updating skill: ${message}`);
      }
    }
  );
}
