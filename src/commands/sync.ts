import { pullHub, isHubCloned } from '../lib/git';
import { saveConfig, loadConfig } from '../lib/config';
import chalk from 'chalk';

export async function syncCommand(): Promise<void> {
  console.log(chalk.blue('Syncing with hub...'));

  try {
    const hubExists = await isHubCloned();
    if (!hubExists) {
      console.error(chalk.red('Hub not found. Run `zanat init` first.'));
      process.exit(1);
    }

    await pullHub();

    // Update last sync time
    const config = await loadConfig();
    if (config) {
      config.lastSync = new Date();
      await saveConfig(config);
    }

    console.log(chalk.green('✓ Hub synced successfully'));
  } catch (error) {
    console.error(chalk.red('Failed to sync:'), error);
    process.exit(1);
  }
}
