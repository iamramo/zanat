import { AgentSkill, Log, Chalk } from '@iamramo/zanat-core';

export const rmCommand = async (fullSkillName: string): Promise<void> => {
  await AgentSkill.remove(fullSkillName);
  Log.msg(Chalk.green(`Removed '${fullSkillName}'`), { prefix: '✔' });
};
