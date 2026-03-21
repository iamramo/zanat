import { pullHub, isHubCloned, saveConfig, loadConfig } from '@iamramo/zanat-core';
import chalk from 'chalk';

export const syncCommand = async (): Promise<void> => {
  console.log(chalk.blue('Syncing with hub...'));

  try {
    const hubExists = await isHubCloned();
    if (!hubExists) {
      console.error(chalk.red('Hub not found. Run `zanat init` first.'));
      process.exit(1);
    }

    await pullHub();

    const config = await loadConfig();
    if (config) {
      config.lastSync = new Date().toISOString();
      await saveConfig(config);
    }

    console.log(chalk.green('✓ Hub synced successfully'));
  } catch (error) {
    console.error(chalk.red('Failed to sync:'), error);
    process.exit(1);
  }
};
