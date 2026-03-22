import { Git, Config, Log } from '@iamramo/zanat-core';
import { ensureHubExists } from '../utils/validation.js';

export const syncCommand = async (): Promise<void> => {
  try {
    await ensureHubExists();

    Log.blue('Syncing with hub...');

    const config = await Config.get();
    await Git.pull(config.hubDir);

    config.lastSync = new Date().toISOString();
    await Config.update(config);

    Log.green('Hub synced successfully', { prefix: '✓' });
  } catch {
    Log.red('Failed to sync', { prefix: '✗' });
    process.exit(1);
  }
};
