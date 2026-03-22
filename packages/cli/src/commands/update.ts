import { Log, Prompt, LockFile, Path, Skill, Config, Zod } from '@iamramo/zanat-core';

export const updateCommand = async (fullSkillName: string | undefined): Promise<void> => {
  try {
    await Config.validate();

    // Update one skill
    if (fullSkillName) {
      Zod.skill.FullNameSchema.parse(fullSkillName);

      const { namespace, skillName } = Path.toSkillParts(fullSkillName);

      await Skill.update(namespace, skillName);
      Log.green(`Updated ${fullSkillName}`, { prefix: '✓' });
      return;
    }

    // Update all skill
    const skills = await LockFile.findAll();
    const addedSkills = Object.keys(skills);

    if (addedSkills.length === 0) {
      Log.blue('No skills to update');
      return;
    }

    const shouldUpdate = await Prompt.confirm({
      message: `This will update ${addedSkills.length} skill(s). Continue?`,
      default: true,
    });

    if (!shouldUpdate) {
      Log.blue('Update cancelled');
      return;
    }

    Log.blue(`Updating ${addedSkills.length} skill(s)...`);
    await Skill.updateAll();
    Log.green('Updated all skills', { prefix: '✓' });
  } catch {
    Log.red('Failed to update', { prefix: '✗' });
    process.exit(1);
  }
};
