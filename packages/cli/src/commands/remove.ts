import { Skill, Fs, Path, Log, Config, Zod } from '@iamramo/zanat-core';
import path from 'node:path';

export const removeCommand = async (fullSkillName: string): Promise<void> => {
  try {
    await Config.validate();
    Zod.FullSkillNameSchema.parse(fullSkillName);

    const { namespace, skillName } = Path.toSkillParts(fullSkillName);
    const skillPath = path.join(Path.AGENTS_SKILLS_DIR, fullSkillName);

    const exists = await Fs.exists(skillPath);
    if (!exists) {
      Log.red('Skill not found.', { prefix: '✗' });
      return;
    }

    await Skill.remove(skillPath);

    Log.green(`Removed ${fullSkillName}`, { prefix: '✓' });
  } catch {
    Log.red('Failed to remove', { prefix: '✗' });
    process.exit(1);
  }
};
