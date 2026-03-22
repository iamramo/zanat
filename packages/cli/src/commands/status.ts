import { Time, Fs, Git, LockFile, Display, Config, Logger } from '@iamramo/zanat-core';

export const statusCommand = async (): Promise<void> => {
  try {
    const skills = await LockFile.findAll();
    const skillNames = Object.keys(skills);
    const config = await Config.get();

    Logger.blue('Hub Status:');
    Logger.blank();

    const hubExists = await Fs.exists(`${config.hubDir}/.git`);
    if (!hubExists) {
      Logger.gray('Not initialized');
      Logger.gray('Run `zanat init` to set up');
      return;
    }

    Logger.green(`Initialized: ${Logger.bold('yes')}`, { prefix: '•' });
    Logger.green(`Repository: ${Logger.bold(config.hubUrl)}`, { prefix: '•' });
    Logger.green(`Branch: ${Logger.bold(config.hubBranch)}`, { prefix: '•' });
    Logger.green(`Last sync: ${Logger.bold(Time.ago(config?.lastSync))}`, { prefix: '•' });

    const behind = await Git.behind(config.hubDir, config.hubBranch);
    if (behind > 0) {
      Logger.yellow(`Behind: ${behind} commit${behind === 1 ? '' : 's'}`, { prefix: '•' });
    } else {
      Logger.green(`Behind: ${Logger.bold('0 commits (up-to-date)')}`, { prefix: '•' });
    }

    Logger.blank();
    Logger.blue('Skills:');
    Logger.blank();
    Logger.green(`Added: ${Logger.bold(skillNames.length.toString())}`, { prefix: '•' });

    if (skillNames.length > 0) {
      skillNames.forEach((skillName: string) => {
        const skill = skills[skillName];

        Logger.gray(`${skillName} ${Display.getDisplayVersion(skill?.version ?? 'latest')}`, {
          prefix: '•',
          spacing: 2,
        });
      });
    }

    Logger.blank();
  } catch (error) {
    Logger.red('Failed to get status', { prefix: '✗' });
    process.exit(1);
  }
};
