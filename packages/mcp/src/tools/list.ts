import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { LockFile, Config } from '@iamramo/zanat-core';
import { text, json } from '../response.js';

export function registerList(server: McpServer): void {
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
}
