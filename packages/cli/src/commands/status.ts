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
    Log.green(`Initialized: ${Log.bold('yes')}`, { prefix: '•' });
    Log.green(`Repository: ${Log.bold(config.hubUrl)}`, { prefix: '•' });
    Log.green(`Branch: ${Log.bold(config.hubBranch)}`, { prefix: '•' });
    Log.green(`Last sync: ${Log.bold(Display.timeAgo(config?.lastSync))}`, { prefix: '•' });

    const behind = await Git.behind(config.hubDir, config.hubBranch);
    if (behind > 0) {
      Log.yellow(`Behind: ${behind} commit(s)`, { prefix: '•' });
    } else {
      Log.green(`Behind: ${Log.bold('up-to-date')}`, { prefix: '•' });
    }

    Log.blank();
    Log.blue('Skills:');
    Log.blank();
    Log.green(`Added: ${Log.bold(skillNames.length.toString())}`, { prefix: '•' });

    if (skillNames.length > 0) {
      skillNames.forEach((skillName: string) => {
        const skill = skills[skillName];

        Log.gray(`${skillName} ${Display.getDisplayVersion(skill?.version ?? 'latest')}`, {
          prefix: '•',
          spacing: 2,
        });
      });
    }
    // TODO: Add if no skills found

    Log.blank();
  } catch {
    Log.red('Failed to get status', { prefix: '✗' });
    process.exit(1);
  }
};
