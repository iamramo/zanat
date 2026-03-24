import { Git, LockFile, Display, Config, Log } from '@iamramo/zanat-core';

export const statusCommand = async (): Promise<void> => {
  try {
    // Step 1: Load configuration and skills
    await Config.validate();
    const skills = await LockFile.findAll();
    const skillNames = Object.keys(skills);
    const config = await Config.get();

    // Step 2: Display hub status
    Log.blue(Log.bold('Hub Status:'));
    Log.blank();
    Log.status('Initialized:', 'yes', 'green', { prefix: '•', spacing: 2 });
    Log.status('Repository:', config.hubUrl, 'green', { prefix: '•', spacing: 2 });
    Log.status('Branch:', config.hubBranch, 'green', { prefix: '•', spacing: 2 });
    Log.status('Last pull:', Display.timeAgo(config?.lastPull), 'green', {
      prefix: '•',
      spacing: 2,
    });

    // Check if remote branch exists before trying to get behind count
    const remoteExists = await Git.remoteBranchExists(config.hubBranch);
    if (!remoteExists) {
      Log.yellow(`Remote branch 'origin/${config.hubBranch}' not found.`, {
        prefix: '⚠',
        spacing: 2,
      });
      return;
    }

    const behind = await Git.behind(config.hubBranch);
    if (behind === 0) {
      Log.status('Behind:', Log.bold('up-to-date'), 'green', { prefix: '•', spacing: 2 });
    } else {
      Log.status('Behind:', `${behind} commit(s)`, 'yellow', { prefix: '•', spacing: 2 });
    }

    // Step 3: Display skills status
    Log.blank();
    Log.blue(Log.bold('Skills:'));
    Log.blank();

    if (skillNames.length > 0) {
      for (const skillName of skillNames) {
        const displayVersion = await Display.getDisplayVersion(skillName);

        Log.status(`${skillName}`, displayVersion, 'blue', {
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
