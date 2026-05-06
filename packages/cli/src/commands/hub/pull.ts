import { Git, Config, Log, Chalk } from '@iamramo/zanat-core';

export const hubPullCommand = async (): Promise<void> => {
  const config = await Config.getActiveHub();

  // Step 1: Capture current HEAD before pull
  Log.msg(Chalk.blue('Pulling latest changes...'));
  const beforeSha = await Git.resolveCommit(config.branch);
  await Git.pull();
  const afterSha = await Git.resolveCommit(config.branch);

  // Step 2: Report what changed
  if (beforeSha === afterSha) {
    Log.msg(Chalk.green(`Pulled '${config.branch}' (already up to date)`), { prefix: '✔' });
  } else {
    const count = await Git.behind(beforeSha, afterSha);
    Log.msg(
      Chalk.green(`Pulled '${config.branch}' (${count} new commit${count === 1 ? '' : 's'})`),
      { prefix: '✔' }
    );
  }

  // Step 3: Always update timestamp
  const full = await Config.get();
  full.hubs[full.activeHub]!.lastPull = new Date().toISOString();
  await Config.update(full);
};
