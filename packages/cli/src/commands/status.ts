import { Git, LockFile, Display, Config, Log } from '@iamramo/zanat-core';

export const statusCommand = async (): Promise<void> => {
  try {
    // Step 1: Load configuration and skills
    await Config.validate();
    const skills = await LockFile.findAll();
    const skillNames = Object.keys(skills);
    const config = await Config.get();

    // Step 2: Display hub status
    Log.blue('Hub Status:');
    Log.blank();
    Log.green(`Initialized: ${Log.bold('yes')}`, { prefix: '•', spacing: 2 });
    Log.green(`Repository: ${Log.bold(config.hubUrl)}`, { prefix: '•', spacing: 2 });
    Log.green(`Branch: ${Log.bold(config.hubBranch)}`, { prefix: '•', spacing: 2 });
    Log.green(`Last pull: ${Log.bold(Display.timeAgo(config?.lastPull))}`, {
      prefix: '•',
      spacing: 2,
    });

    const behind = await Git.behind(config.hubBranch);
    if (behind === 0) {
      Log.green(`Behind: ${Log.bold('up-to-date')}`, { prefix: '•', spacing: 2 });
    } else {
      Log.yellow(`Behind: ${behind} commit(s)`, { prefix: '•', spacing: 2 });
    }

    // Step 3: Display skills status
    Log.blank();
    Log.blue('Skills:');
    Log.blank();

    if (skillNames.length > 0) {
      for (const skillName of skillNames) {
        const displayVersion = await Display.getDisplayVersion(skillName);

        Log.green(`${skillName} ${displayVersion}`, {
          prefix: '•',
          spacing: 2,
        });
      }
    } else {
      Log.gray('No skills added.', { spacing: 2 });
    }

    Log.blank();
  } catch (error) {
    Log.red('Failed to get status', { prefix: '✗' });
    Log.debug(error);
    process.exit(1);
  }
};
