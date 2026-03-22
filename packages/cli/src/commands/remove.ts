import { Skill, Fs, Path, Log, Config } from '@iamramo/zanat-core';
import path from 'node:path';

export const removeCommand = async (skillArg: string): Promise<void> => {
  try {
    await Config.validate();

    const { namespace, skillName } = Path.toSkillParts(skillArg);
    const fullSkillName = Path.getFullSkillName(namespace, skillName);
    const skillPath = path.join(Path.AGENTS_SKILLS_DIR, fullSkillName);

    const exists = await Fs.exists(skillPath);
    if (!exists) {
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
