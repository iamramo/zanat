import { Skill, Fs, Path, Log, Config, Zod } from '@iamramo/zanat-core';

export const removeCommand = async (fullSkillName: string): Promise<void> => {
  try {
    // Step 1: Validate and parse inputs
    await Config.validate();
    Zod.skill.FullSchema.shape.fullName.parse(fullSkillName);
    Path.toSkillParts(fullSkillName);

    // Step 2: Check skill exists
    const skillPath = Path.getSkillTargetDir(fullSkillName);
    const exists = await Fs.exists(skillPath);

    if (!exists) {
      Log.red('Skill not found.', { prefix: '✗' });
      process.exit(1);
    }

    // Step 2: Remove skill from storage
    await Skill.remove(skillPath);
    Log.green(`Removed ${fullSkillName}`, { prefix: '✓' });
  } catch (error) {
    Log.red('Failed to remove', { prefix: '✗' });
    Log.debug(error);
    process.exit(1);
  }
};
