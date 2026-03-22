import { Log, Prompt, LockFile, Path, Skill } from '@iamramo/zanat-core';
import { ensureHubExists } from '../utils/validation.js';

export const updateCommand = async (
  skillArg: string | undefined,
  options: { yes?: boolean }
): Promise<void> => {
  try {
    await ensureHubExists();

    // Update one skill
    if (skillArg) {
      const { namespace, skillName } = Path.toSkillParts(skillArg);

      Log.blue(`Updating skill: ${skillArg}...`);
      await Skill.update(namespace, skillName);
      Log.green(`Updated ${skillArg}`, { prefix: '✓' });
      return;
    }

    // Update all skill
    const skills = await LockFile.findAll();
    const addedSkills = Object.keys(skills);

    if (addedSkills.length === 0) {
      Log.blue('No skills to update');
      return;
    }

    if (!options.yes) {
      const shouldUpdate = await Prompt.confirm({
        message: `This will update ${addedSkills.length} skill(s). Continue?`,
        default: true,
      });

      if (!shouldUpdate) {
        Log.blue('Update cancelled');
        return;
      }
    }

    Log.blue(`Updating ${addedSkills.length} skill(s)...`);
    await Skill.updateAll();
    Log.green('Updated all skills', { prefix: '✓' });
  } catch {
    Log.red('Failed to update', { prefix: '✗' });
    process.exit(1);
  }
};
