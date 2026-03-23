import { Git, Config, Log } from '@iamramo/zanat-core';

export const pullCommand = async (): Promise<void> => {
  try {
    await Config.validate();

    Log.blue('Pulling latest changes from hub...');

    const config = await Config.get();
    await Git.pull(config.hubDir);

    config.lastPull = new Date().toISOString();
    await Config.update(config);

    Log.green('Hub updated successfully', { prefix: '✓' });
  } catch (error) {
    Log.red('Failed to pull', { prefix: '✗' });
    Log.debug(error);
    process.exit(1);
  }
};
