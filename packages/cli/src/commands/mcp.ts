import { Mcp } from '@iamramo/zanat-core';
import packageJson from '../../package.json' with { type: 'json' };

export const mcpCommand = async (): Promise<void> => {
  await Mcp.start(packageJson.version);
};
