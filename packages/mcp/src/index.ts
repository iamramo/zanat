import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Config, Git, Node, Format } from '@iamramo/zanat-core';
import { registerSearch } from './tools/search.js';
import { registerList } from './tools/list.js';
import { registerGet } from './tools/get.js';
import { registerAdd } from './tools/add.js';
import { registerUpdate } from './tools/update.js';
import { registerRemove } from './tools/remove.js';
import packageJson from '../package.json' with { type: 'json' };

async function ensureOnHubBranch(): Promise<void> {
  await Config.validate();

  const config = await Config.getActiveHub();
  const currentBranch = await Git.getCurrentBranch();
  if (currentBranch !== config.branch) {
    await Git.checkout(config.branch);
  }
}

async function main(): Promise<void> {
  Node.checkVersion(parseInt(packageJson.engines.node.replace('>=', ''), 10));
  await ensureOnHubBranch();

  const server = new McpServer({
    name: 'zanat',
    version: packageJson.version,
  });

  registerSearch(server);
  registerList(server);
  registerGet(server);
  registerAdd(server);
  registerUpdate(server);
  registerRemove(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(`Zanat MCP failed to start: ${Format.json(error)}`);
  process.exit(1);
});
