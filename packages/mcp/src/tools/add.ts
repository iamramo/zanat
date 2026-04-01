import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AgentSkill, HubSkill, LockFile, Config, Git, Path, Fs, Zod } from '@iamramo/zanat-core';
import { text, error } from '../response.js';

export function registerAdd(server: McpServer): void {
  server.registerTool(
    'add_skill',
    {
      description: 'Install a skill from the hub. Optionally pin to a specific tag or commit SHA.',
      inputSchema: {
        fullName: Zod.skill.FullSchema.shape.fullName,
        pin: Zod.z
          .string()
          .optional()
          .describe('Pin to a specific tag or commit SHA. Branch pinning is not supported.'),
      },
    },
    async ({ fullName, pin }) => {
      try {
        // Check if already installed
        const existingLock = await LockFile.find(fullName).catch(() => undefined);
        if (existingLock) {
          return text(`Skill '${fullName}' is already installed. Remove it first or use update.`);
        }

        const config = await Config.get();

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

        return text(`Skill '${fullName}' has been installed.`);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return error(`Error adding skill: ${message}`);
      }
    }
  );
}
