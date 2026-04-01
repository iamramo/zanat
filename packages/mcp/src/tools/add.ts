import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AgentSkill, HubSkill, LockFile, Config, Git, Path, Fs, Zod } from '@iamramo/zanat-core';
import { text, error } from '../response.js';

export function registerAdd(server: McpServer): void {
  server.registerTool(
    'add_skill',
    {
      description:
        'Add a skill from the hub. Omit skill_name to add all skills not yet added. Optionally pin to a specific tag or commit SHA.',
      inputSchema: {
        fullName: Zod.skill.FullSchema.shape.fullName.optional(),
        pin: Zod.z
          .string()
          .optional()
          .describe('Pin to a specific tag or commit SHA. Branch pinning is not supported.'),
      },
    },
    async ({ fullName, pin }) => {
      try {
        const config = await Config.get();

        // Bulk-add: no skill name provided
        if (fullName === undefined) {
          if (pin) {
            return text('--pin cannot be used without a skill name.');
          }

          await Git.pull();

          const allHubSkills = await HubSkill.findAll();
          const lockFileSkills = await LockFile.findAll();
          const addedNames = new Set(Object.keys(lockFileSkills));
          const toAdd = allHubSkills.filter((s) => !addedNames.has(s.fullName));

          if (toAdd.length === 0) {
            return text('All hub skills are already added.');
          }

          const resolvedCommit = await Git.resolveCommit(config.hubBranch);
          for (const skill of toAdd) {
            await AgentSkill.add(skill.fullName, config.hubBranch, resolvedCommit);
          }

          return text(`Added ${toAdd.length} skill(s): ${toAdd.map((s) => s.fullName).join(', ')}`);
        }

        // Single-skill add
        const existingLock = await LockFile.find(fullName).catch(() => undefined);
        if (existingLock) {
          return text(`Skill '${fullName}' is already added. Remove it first or use update.`);
        }

        let requestedRef: string;
        let resolvedCommit: string;

        if (pin) {
          // Validate pin is not a branch
          const refType = await Git.getRefType(pin);
          if (refType === 'branch') {
            return text('Branch pinning is not supported. Use a tag or commit SHA.');
          }

          // Verify skill directory exists in hub
          const sourceDir = await Path.getHubSkillPath(fullName);
          if (!(await Fs.exists(sourceDir))) {
            return text(`Skill '${fullName}' does not exist in hub.`);
          }

          requestedRef = pin;
          resolvedCommit = await Git.resolveCommit(pin);
        } else {
          // Ensure skill exists in hub
          const hubSkill = await HubSkill.find(fullName);
          if (!hubSkill) {
            return text(`Skill '${fullName}' not found in hub.`);
          }

          await Git.pull();
          requestedRef = config.hubBranch;
          resolvedCommit = await Git.resolveCommit(config.hubBranch);
        }

        await AgentSkill.add(fullName, requestedRef, resolvedCommit);

        return text(`Skill '${fullName}' has been added.`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return error(`Error adding skill: ${message}`);
      }
    }
  );
}
