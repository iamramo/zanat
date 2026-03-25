import { Skill, Fs, Path, Log } from '@iamramo/zanat-core';

export const removeCommand = async (fullSkillName: string): Promise<void> => {
  // Step 1: Check skill exists
  const skillPath = Path.getAgentsSkillPath(fullSkillName);
  const exists = await Fs.exists(skillPath);

  if (!exists) {
    Log.red('Skill not found.', { prefix: '✗' });
    process.exit(1);
  }

  // Step 2: Remove skill from storage
  await Skill.remove(skillPath);
  Log.green(`Removed ${fullSkillName}`, { prefix: '✓' });
};
