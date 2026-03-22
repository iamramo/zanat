import { Config, Log } from '@iamramo/zanat-core';

export const ensureHubExists = async (): Promise<void> => {
  const config = await Config.get().catch(() => undefined);
  if (!config) {
    Log.red('Hub not found. Run `zanat init` first.', { prefix: '✗' });
    process.exit(1);
  }
};
