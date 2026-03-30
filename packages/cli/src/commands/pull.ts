import { Git, Config, Log, Chalk } from '@iamramo/zanat-core';

export const pullCommand = async (): Promise<void> => {
  const config = await Config.get();

  // Step 1: Pull hubBranch
  Log.msg(Chalk.blue('Pulling latest changes...'));
  await Git.pull();
  Log.msg(Chalk.green(`Pulled '${config.hubBranch}'`), { prefix: '✓' });

  // Step 2: Always update timestamp
  config.lastPull = new Date().toISOString();
  await Config.update(config);
};
