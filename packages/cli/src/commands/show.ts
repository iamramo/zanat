import { Skill, Log, Config } from '@iamramo/zanat-core';

interface ShowOptions {
  ref?: string;
}

export const showCommand = async (fullSkillName: string, options: ShowOptions): Promise<void> => {
  // Step 1: Get skill from filesystem (current branch)
  const skill = await Skill.find(fullSkillName);

    if (!skill) {
      Log.red(`Skill not found in hub: ${fullSkillName}`, { prefix: '✗' });
      Log.gray('Use "zanat search" to find available skills.');
      process.exit(1);
    }

    // Step 3: Print the content
    console.log(skill.content);
};
