import { LockFile, Display, Log } from '@iamramo/zanat-core';
import { ensureHubExists } from '../utils/validation.js';

export const listCommand = async (): Promise<void> => {
  try {
    await ensureHubExists();

    const skills = await LockFile.findAll();
    const skillNames = Object.keys(skills);

    if (skillNames.length === 0) {
      Log.gray('No skills added.');
      Log.gray('Run `zanat search` to find skills or `zanat add <skill>` to add one.');
      return;
    }

    Log.blue('Added skills:');
    Log.blank();

    skillNames.forEach((skillName: string) => {
      const skill = skills[skillName];
      Log.green(`${skillName} ${Display.getDisplayVersion(skill?.version ?? 'latest')}`, {
        prefix: '•',
      });
    });

    Log.blank();
    Log.gray(`Total: ${skillNames.length} skill${skillNames.length === 1 ? '' : 's'}`);
  } catch {
    Log.red('Failed to list skills', { prefix: '✗' });
    process.exit(1);
  }
};
