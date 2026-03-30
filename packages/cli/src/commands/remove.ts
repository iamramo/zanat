import { A_Skill, Fs, Path, Log, Chalk } from '@iamramo/zanat-core';

export const removeCommand = async (fullSkillName: string): Promise<void> => {
  // Step 1: Check skill exists
  const skillPath = Path.getAgentsSkillPath(fullSkillName);
  const agentSkillExists = await Fs.exists(skillPath);

  if (!agentSkillExists) {
    Log.msg(Chalk.red('Skill not found.'), { prefix: '✗' });
    process.exit(1);
  }

  // Step 2: Remove skill from storage
  await A_Skill.remove(skillPath);
  Log.msg(Chalk.green(`Removed ${fullSkillName}`), { prefix: '✓' });
};
