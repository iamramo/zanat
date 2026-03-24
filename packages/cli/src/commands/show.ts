import { Skill, Log, Config, Zod, Path, Git } from '@iamramo/zanat-core';

interface ShowOptions {
  ref?: string;
}

export const showCommand = async (fullSkillName: string, options: ShowOptions): Promise<void> => {
  try {
    // Step 1: Validate inputs
    await Config.validate();
    Zod.skill.FullSchema.shape.fullName.parse(fullSkillName);

    // Step 2: Get skill from filesystem (current branch)
    const skill = await Skill.find(fullSkillName);

    if (!skill) {
      Log.red(`Skill not found in hub: ${fullSkillName}`, { prefix: '✗' });
      Log.gray('Use "zanat search" to find available skills.');
      process.exit(1);
    }

    // Step 3: Print the content
    console.log(skill.content);
  } catch (error) {
    Log.red('Failed to show skill', { prefix: '✗' });
    Log.debug(error);
    process.exit(1);
  }
};
