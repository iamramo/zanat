import { Fs, Git, LockFile, Display, Config, Log } from '@iamramo/zanat-core';
import { ensureHubExists } from '../utils/validation.js';

export const statusCommand = async (): Promise<void> => {
  try {
    await ensureHubExists();

    const skills = await LockFile.findAll();
    const skillNames = Object.keys(skills);
    const config = await Config.get();

    Log.blue('Hub Status:');
    Log.blank();
    Log.green(`Initialized: ${Log.bold('yes')}`, { prefix: '•', spacing: 2 });
    Log.green(`Repository: ${Log.bold(config.hubUrl)}`, { prefix: '•', spacing: 2 });
    Log.green(`Branch: ${Log.bold(config.hubBranch)}`, { prefix: '•', spacing: 2 });
    Log.green(`Last sync: ${Log.bold(Display.timeAgo(config?.lastSync))}`, {
      prefix: '•',
      spacing: 2,
    });

    const behind = await Git.behind(config.hubDir, config.hubBranch);
    if (behind > 0) {
      Log.yellow(`Behind: ${behind} commit(s)`, { prefix: '•', spacing: 2 });
    } else {
      Log.green(`Behind: ${Log.bold('up-to-date')}`, { prefix: '•', spacing: 2 });
    }

    Log.blank();
    Log.blue('Skills:');
    Log.blank();

    if (skillNames.length > 0) {
      skillNames.forEach((skillName: string) => {
        const skill = skills[skillName];

        Log.green(`${skillName} ${Display.getDisplayVersion(skill?.version ?? 'latest')}`, {
          prefix: '•',
          spacing: 2,
        });
      });
    } else {
      Log.gray('No skills added.', { spacing: 2 });
    }

    Log.blank();
  } catch {
    Log.red('Failed to get status', { prefix: '✗' });
    process.exit(1);
  }
};
