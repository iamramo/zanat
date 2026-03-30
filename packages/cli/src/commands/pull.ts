import { Git, Config, LockFile, Log, Chalk } from '@iamramo/zanat-core';

export const pullCommand = async (): Promise<void> => {
  const config = await Config.get();

  // Step 1: Pull hubBranch
  Log.msg(Chalk.blue('Pulling latest changes...'));
  await Git.pull();
  Log.msg(Chalk.green(`Pulled ${config.hubBranch}`), { prefix: '✓' });

  // Step 2: Get unique refs and fetch each
  const allRefs = await LockFile.findUniqueRefs();
  const additionalRefs = allRefs.filter((r) => r !== config.hubBranch);

  const fetchedRefs: string[] = [];
  const failedRefs: { ref: string; skills: string[] }[] = [];

  for (const ref of additionalRefs) {
    try {
      await Git.fetch([ref]);
      fetchedRefs.push(ref);
    } catch (error) {
      Log.debug(error);

      // Find skills using this ref for user guidance
      const affectedSkills = await LockFile.findSkillsByRef(ref);
      failedRefs.push({ ref, skills: affectedSkills });
    }
  }

  // Step 3: Report results
  if (fetchedRefs.length > 0) {
    Log.msg(Chalk.green(`Fetched ${fetchedRefs.length} additional ref(s):`), { prefix: '✓' });
    fetchedRefs.forEach((ref) => Log.msg(Chalk.green(ref), { spacing: 2 }));
  }

  if (failedRefs.length > 0) {
    Log.blank();
    Log.msg(Chalk.yellow(`Warning: Could not fetch ${failedRefs.length} ref(s):`), { prefix: '⚠' });
    failedRefs.forEach(({ ref, skills }) => {
      Log.msg(Chalk.yellow(ref), { spacing: 2 });
      if (skills.length > 0) {
        Log.msg(Chalk.gray(`Affects: ${skills.join(', ')}`), { spacing: 4 });
      }
    });
    Log.blank();
    Log.msg(Chalk.gray('These refs may have been deleted from the remote.'));
    Log.msg(
      Chalk.gray(`To fix affected skills, run: zanat add <skill-name> (re-pins to ${config.hubBranch})`)
    );
  }

  // Step 4: Always update timestamp
  config.lastPull = new Date().toISOString();
  await Config.update(config);
};
