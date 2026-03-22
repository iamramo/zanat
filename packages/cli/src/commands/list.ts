import { LockFile, Display, Logger } from '@iamramo/zanat-core';
import { ensureHubExists } from '../utils/validation.js';

export const listCommand = async (): Promise<void> => {
  try {
    await ensureHubExists();

    const skills = await LockFile.findAll();
    const skillNames = Object.keys(skills);

    if (skillNames.length === 0) {
      Logger.gray('No skills added.');
      Logger.gray('Run `zanat search` to find skills or `zanat add <skill>` to add one.');
      return;
    }

    Logger.blue('Added skills:');
    Logger.blank();

    skillNames.forEach((skillName: string) => {
      const skill = skills[skillName];
      Logger.green(`${skillName} ${Display.getDisplayVersion(skill?.version ?? 'latest')}`, {
        prefix: '•',
      });
    });

    Logger.blank();
    Logger.gray(`Total: ${skillNames.length} skill${skillNames.length === 1 ? '' : 's'}`);
  } catch {
    Logger.red('Failed to list skills', { prefix: '✗' });
    process.exit(1);
  }
};
