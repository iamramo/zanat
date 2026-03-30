import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { HubSkill } from './hub-skill.js';
import { AgentSkill } from './agent-skill.js';
import { LockFile } from './lock-file.js';
import { Config } from './config.js';
import { Git } from './git.js';
import { Zod } from './zod.js';
import { Path } from './path.js';
import { Format } from './format.js';


function text(content: string) {
  return { content: [{ type: 'text' as const, text: content }] };
}

function json(data: unknown) {
  return text(Format.json(data));
}

export const Mcp = {
  async start(version: string): Promise<void> {
    const server = new McpServer({
      name: 'zanat',
      version,
    });

    server.registerTool(
      'search_skills',
      {
        description: 'Search for skills available in the hub. Returns matching skills with name, description, and install status. If no query is provided, returns all available skills.',
        inputSchema: { query: z.string().optional().describe('Search query to filter skills by name, description, or content') },
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
            installed: skill.fullName in lockFileSkills,
          }));

          return json(results);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          return text(`Error searching skills: ${message}`);
        }
      }
    );

    server.registerTool(
      'list_skills',
      { description: 'List all installed skills with their version and pin status.' },
      async () => {
        try {
          const skills = await LockFile.findAll();
          const config = await Config.get();
          const entries = Object.entries(skills);

          if (entries.length === 0) {
            return text('No skills installed.');
          }

          const results = entries.map(([fullName, lock]) => ({
            fullName,
            namespace: lock.namespace,
            skillName: lock.skillName,
            requestedRef: lock.requestedRef,
            resolvedCommit: lock.resolvedCommit,
            pinned: lock.requestedRef !== config.hubBranch,
          }));

          return json(results);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          return text(`Error listing skills: ${message}`);
        }
      }
    );

    server.registerTool(
      'get_skill',
      {
        description: 'Get the full content of a specific skill by its full name (e.g. "vercel.react-patterns"). Returns the skill frontmatter and markdown content.',
        inputSchema: { fullName: z.string().describe('Full skill name (e.g. "vercel.react-patterns")') },
      },
      async ({ fullName }) => {
        try {
          Zod.skill.FullSchema.shape.fullName.parse(fullName);

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

    server.registerTool(
      'add_skill',
      {
        description: 'Install a skill from the hub. Optionally pin to a specific tag or commit SHA.',
        inputSchema: {
          fullName: z.string().describe('Full skill name (e.g. "vercel.react-patterns")'),
          pin: z.string().optional().describe('Pin to a specific tag or commit SHA. Branch pinning is not supported.'),
        },
      },
      async ({ fullName, pin }) => {
        try {
          Zod.skill.FullSchema.shape.fullName.parse(fullName);

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

            // Verify skill exists at that ref
            const sourceFile = await Path.getHubSkillPath(fullName, true);
            try {
              await Git.show(pin, sourceFile);
            } catch {
              return text(`Skill '${fullName}' does not exist at ref '${pin}'.`);
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
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          return text(`Error adding skill: ${message}`);
        }
      }
    );

    server.registerTool(
      'update_skill',
      {
        description: 'Update skill(s) from the hub. If a skill name is provided, updates that skill. Otherwise, updates all non-pinned skills. Pinned skills are always skipped.',
        inputSchema: {
          fullName: z.string().optional().describe('Full skill name to update (e.g. "vercel.react-patterns"). If omitted, updates all non-pinned skills.'),
        },
      },
      async ({ fullName }) => {
        try {
          if (fullName) {
            Zod.skill.FullSchema.shape.fullName.parse(fullName);

            const lockEntry = await LockFile.find(fullName);
            if (!lockEntry) {
              return text(`Skill '${fullName}' is not installed.`);
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
            return text('No skills installed.');
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
            return text('No updatable skills. All installed skills are pinned.');
          }

          await Git.pull();

          for (const name of updatable) {
            await AgentSkill.update(name);
          }

          const result: Record<string, string[]> = { updated: updatable };
          if (pinned.length > 0) result.skipped_pinned = pinned;

          return json(result);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          return text(`Error updating skill: ${message}`);
        }
      }
    );

    server.registerTool(
      'remove_skill',
      {
        description: 'Remove an installed skill.',
        inputSchema: { fullName: z.string().describe('Full skill name (e.g. "vercel.react-patterns")') },
      },
      async ({ fullName }) => {
        try {
          Zod.skill.FullSchema.shape.fullName.parse(fullName);

          const lockEntry = await LockFile.find(fullName);
          if (!lockEntry) {
            return text(`Skill '${fullName}' is not installed.`);
          }

          await AgentSkill.remove(fullName);

          return text(`Skill '${fullName}' has been removed.`);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          return text(`Error removing skill: ${message}`);
        }
      }
    );

    const transport = new StdioServerTransport();
    await server.connect(transport);
  },
} as const;
