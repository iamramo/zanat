import {
  Path,
  Config,
  Fs,
  Git,
  Logger,
  input,
  confirm,
} from '@iamramo/zanat-core';
import path from 'node:path';

export const initCommand = async (): Promise<void> => {
  Logger.blue('Initializing Zanat...');
  Logger.blank();

  try {
    const existingConfig = await Config.get();
    const hubExists = await Fs.exists(`${existingConfig.hubDir}/.git`);

    if (hubExists) {
      Logger.blue('Zanat is already initialized.');
      Logger.blank();

      Logger.blue(`Repository: ${existingConfig.hubUrl}`);
      Logger.blue(`Branch: ${existingConfig.hubBranch}`);

      Logger.blank();

      const shouldReinitialize = await confirm({
        message: 'Reinitialize? Your hub directory will be replaced but added skills stay safe.',
        default: false,
      });

      if (!shouldReinitialize) {
        Logger.blank();
        Logger.blue('Keeping existing setup.');
        return;
      }

      Logger.blank();
      Logger.blue('Removing existing hub...');
      await Fs.remove(existingConfig.hubDir);
      Logger.green('Removed existing hub', { prefix: '✓' });
      Logger.blank();
    }

    const hubUrl = await input({
      message: 'Hub repository URL:',
      default: 'https://github.com/iamramo/zanat-hub.git',
    });

    const hubBranch = await input({
      message: 'Hub branch:',
      default: 'main',
    });

    const hubDir = await input({
      message: 'Hub directory path:',
      default: `${Path.ZANAT_DIR}/hub`,
    });

    Logger.blank();
    Logger.blue('Setting up directories...');

    await Fs.ensureDir(Path.ZANAT_DIR);
    Logger.green(`Created ${Path.ZANAT_DIR}`, { prefix: '✓' });

    const config = {
      hubUrl,
      hubBranch,
      hubDir,
      lastSync: new Date().toISOString(),
    };

    await Fs.ensureDir(Path.AGENTS_DIR);

    Logger.blank();
    Logger.blue('Cloning hub repository...');
    await Git.clone(hubUrl, hubBranch, hubDir);
    Logger.green(`Cloned hub to ${hubDir}`, { prefix: '✓' });

    await Fs.ensureDir(path.dirname(Path.CONFIG_FILE));
    await Fs.writeFile(Path.CONFIG_FILE, JSON.stringify(config, null, 2));
    Logger.green(`Created config.json in ${Path.CONFIG_FILE}`, { prefix: '✓' });

    Logger.blank();
    Logger.green('Zanat initialized successfully!', { prefix: '✓' });
  } catch (error) {
    Logger.red('Failed to initialize', { prefix: '✗' });
    process.exit(1);
  }
};
