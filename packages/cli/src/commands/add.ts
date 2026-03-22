import { Log, Prompt, LockFile, Skill, Path, Config, Zod } from '@iamramo/zanat-core';

export const addCommand = async (fullSkillName: string): Promise<void> => {
  try {
    await Config.validate();
    Zod.skill.FullNameSchema.parse(fullSkillName);

    const { namespace, skillName } = Path.toSkillParts(fullSkillName);

    const exists = await LockFile.find(fullSkillName);

    if (exists) {
      const shouldUpdate = await Prompt.confirm({
        message: `Skill ${fullSkillName} is already added. Update from hub?`,
        default: true,
      });

      if (!shouldUpdate) {
        Log.blue('Cancelled');
        return;
      }

      await Skill.update(namespace, skillName);
      Log.green(`Updated ${fullSkillName}`, { prefix: '✓' });
      return;
    }

    const sourcePath = await Path.getSkillHubDir(namespace, skillName);
    const targetPath = Path.getSkillTargetDir(fullSkillName);
    const skillFile = Path.getSkillFile(sourcePath);

    await Skill.add(namespace, skillName, skillFile, targetPath);
    Log.green(`Added ${fullSkillName}`);
  } catch {
    Log.red('Failed to add', { prefix: '✗' });
    process.exit(1);
  }
};
