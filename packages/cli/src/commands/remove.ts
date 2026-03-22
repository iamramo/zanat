import { LockFile, Skills, Path, Logger } from '@iamramo/zanat-core';
import path from 'node:path';
import { validateSkillArg, ensureHubExists } from '../utils/validation.js';

export const removeCommand = async (skillArg: string): Promise<void> => {
  Logger.blue(`Removing skill: ${skillArg}...`);

  try {
    await ensureHubExists();
    const { namespace, skillName } = validateSkillArg(skillArg);
    const fullSkillName = [...namespace, skillName].join('.');
    const skillPath = path.join(Path.AGENTS_SKILLS_DIR, fullSkillName);

    await Skills.remove(skillPath);
    await LockFile.remove(fullSkillName);

    Logger.green(`Removed ${skillArg}`, { prefix: '✓' });
  } catch (error) {
    Logger.red('Failed to remove', { prefix: '✗' });
    process.exit(1);
  }
};
