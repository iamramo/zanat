import { HubSkill, Log, Chalk } from '@iamramo/zanat-core';

export const showCommand = async (fullSkillName: string): Promise<void> => {
  // Step 1: Get skill from filesystem (current branch)
  const skill = await HubSkill.find(fullSkillName);

  if (!skill) {
    Log.msg(Chalk.red(`Skill '${fullSkillName}' not found in hub.`), { prefix: '✗' });
    Log.msg(Chalk.gray(`Use 'zanat skill search' to find available skills.`));
    process.exit(1);
  }

  // Step 2: Print the content
  Log.msg(skill.content);
};
