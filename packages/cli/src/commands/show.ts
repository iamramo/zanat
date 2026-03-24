import { Skill, Log, Config, Zod, Path, Git } from '@iamramo/zanat-core';
import { z } from 'zod';

const RefOptionSchema = z.union([
  z.string().min(1, '--ref requires a value (branch, tag, or commit)'),
  z.undefined(),
]);

interface ShowOptions {
  ref?: string;
}

export const showCommand = async (fullSkillName: string, options: ShowOptions): Promise<void> => {
  try {
    // Step 1: Validate inputs
    await Config.validate();
    Zod.skill.FullSchema.shape.fullName.parse(fullSkillName);

    const refOption = RefOptionSchema.parse(options.ref);
    const { namespace, skillName } = Path.toSkillParts(fullSkillName);
    const hubFilePath = Path.getSkillFilePath(namespace, skillName);

    let content: string;

    if (refOption !== undefined) {
      // Step 2a: Fetch content from specific ref using git
      try {
        content = await Git.show(refOption, hubFilePath);
      } catch {
        Log.red(`Skill not found at ref '${refOption}'`, { prefix: '✗' });
        process.exit(1);
      }
    } else {
      // Step 2b: Get skill from filesystem (current branch)
      const skill = await Skill.find(fullSkillName);

      if (!skill) {
        Log.red(`Skill not found in hub: ${fullSkillName}`, { prefix: '✗' });
        Log.gray('Use "zanat search" to find available skills.');
        Log.gray(`If the skill exists on a different branch, use: zanat show ${fullSkillName} --ref=<branch>`);
        process.exit(1);
      }

      content = skill.content;
    }

    // Step 3: Print the content
    console.log(content);
  } catch (error) {
    Log.red('Failed to show skill', { prefix: '✗' });
    Log.debug(error);
    process.exit(1);
  }
};
