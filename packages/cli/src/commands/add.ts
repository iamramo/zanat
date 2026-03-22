import { Log, Prompt, LockFile, Skill, Path, Config } from '@iamramo/zanat-core';

export const addCommand = async (skillArg: string): Promise<void> => {
  try {
    await Config.validate();

    const { namespace, skillName } = Path.toSkillParts(skillArg);
    const fullSkillName = Path.getFullSkillName(namespace, skillName);

    const exists = await LockFile.find(fullSkillName);

    if (exists) {
      const shouldUpdate = await Prompt.confirm({
        message: `Skill ${skillArg} is already added. Update from hub?`,
        default: true,
      });

      if (!shouldUpdate) {
        Log.blue('Cancelled');
        return;
      }

      await Skill.update(namespace, skillName);
      Log.green(`Updated ${skillArg}`, { prefix: '✓' });
      return;
    }

    const sourcePath = await Path.getSkillHubDir(namespace, skillName);
    const targetPath = Path.getSkillTargetDir(fullSkillName);
    const skillFile = Path.getSkillFile(sourcePath);

    await Skill.add(namespace, skillName, skillFile, targetPath);
    Log.green(`Added ${skillArg}`);
  } catch {
    Log.red('Failed to add', { prefix: '✗' });
    process.exit(1);
  }
};
