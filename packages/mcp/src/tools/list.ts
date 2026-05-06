import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { LockFile, Config } from '@iamramo/zanat-core';
import { text, json, error } from '../response.js';

export function registerList(server: McpServer): void {
  server.registerTool(
    'list_skills',
    { description: 'List all added skills with their version and pin status.' },
    async () => {
      try {
        const skills = await LockFile.findAll();
        const config = await Config.getActiveHub();
        const entries = Object.entries(skills);

        if (entries.length === 0) {
          return text('No skills added.');
        }

        const results = entries.map(([fullName, lock]) => ({
          fullName,
          namespace: lock.namespace,
          skillName: lock.skillName,
          requestedRef: lock.requestedRef,
          resolvedCommit: lock.resolvedCommit,
          pinned: lock.requestedRef !== config.branch,
        }));

        return json(results);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return error(`Error listing skills: ${message}`);
      }
    }
  );
}
