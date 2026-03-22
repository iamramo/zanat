import { Git, Config, Logger } from '@iamramo/zanat-core';
import { ensureHubExists } from '../utils/validation.js';

export const syncCommand = async (): Promise<void> => {
  Logger.blue('Syncing with hub...');

  try {
    await ensureHubExists();
    const config = await Config.get();
    await Git.pull(config.hubDir);

    config.lastSync = new Date().toISOString();
    await Config.update(config);

    Logger.green('Hub synced successfully', { prefix: '✓' });
  } catch (error) {
    Logger.red('Failed to sync', { prefix: '✗' });
    process.exit(1);
  }
};
