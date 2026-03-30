import { A_Skill, Log, Chalk } from '@iamramo/zanat-core';

export const rmCommand = async (fullSkillName: string): Promise<void> => {
  await A_Skill.remove(fullSkillName);
  Log.msg(Chalk.green(`Removed '${fullSkillName}'`), { prefix: '✓' });
};
