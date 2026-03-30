import { Git, Config, Log, Chalk } from '@iamramo/zanat-core';

export const pullCommand = async (): Promise<void> => {
  const config = await Config.get();

  // Step 1: Capture current HEAD before pull
  Log.msg(Chalk.blue('Pulling latest changes...'));
  const beforeSha = await Git.resolveCommit(config.hubBranch);
  await Git.pull();
  const afterSha = await Git.resolveCommit(config.hubBranch);

  // Step 2: Report what changed
  if (beforeSha === afterSha) {
    Log.msg(Chalk.green(`Pulled '${config.hubBranch}' (already up to date)`), { prefix: '✔' });
  } else {
    const count = await Git.behind(beforeSha, afterSha);
    Log.msg(Chalk.green(`Pulled '${config.hubBranch}' (${count} new commit${count === 1 ? '' : 's'})`), { prefix: '✔' });
  }

  // Step 3: Always update timestamp
  config.lastPull = new Date().toISOString();
  await Config.update(config);
};
