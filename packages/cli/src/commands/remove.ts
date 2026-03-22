import { Skill, Path, Log } from '@iamramo/zanat-core';
import path from 'node:path';
import { validateSkillArg, ensureHubExists } from '../utils/validation.js';

export const removeCommand = async (skillArg: string): Promise<void> => {
  Log.blue(`Removing skill: ${skillArg}...`);

  try {
    await ensureHubExists();
    const { namespace, skillName } = validateSkillArg(skillArg);
    const fullSkillName = Path.getFullSkillName(namespace, skillName);
    const skillPath = path.join(Path.AGENTS_SKILLS_DIR, fullSkillName);

    const skill = await Skill.find(skillPath);

    if (!skill) {
      Log.red('Skill not found.', { prefix: '✗' });
      return;
    }

    await Skill.remove(skillPath);

    Log.green(`Removed ${skillArg}`, { prefix: '✓' });
  } catch {
    Log.red('Failed to remove', { prefix: '✗' });
    process.exit(1);
  }
};
