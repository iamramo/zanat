import { pullHub, saveConfig, loadConfig, logger } from '@iamramo/zanat-core';
import { ensureHubExists } from '../utils/validation.js';

export const syncCommand = async (): Promise<void> => {
  logger.info('Syncing with hub...');

  try {
    await ensureHubExists();
    await pullHub();

    const config = await loadConfig();
    if (config) {
      config.lastSync = new Date().toISOString();
      await saveConfig(config);
    }

    logger.success('Hub synced successfully');
  } catch (error) {
    logger.error('Failed to sync', error);
    process.exit(1);
  }
};
