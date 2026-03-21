import { installSkill, isHubCloned } from '@iamramo/zanat-core';
import { SkillArgSchema } from '../schemas/skill-arg.js';
import chalk from 'chalk';

export const installCommand = async (skillArg: string): Promise<void> => {
  console.log(chalk.blue(`Installing skill: ${skillArg}...`));

  try {
    const hubExists = await isHubCloned();
    if (!hubExists) {
      console.error(chalk.red('Hub not found. Run `zanat init` first.'));
      process.exit(1);
    }

    const result = SkillArgSchema.safeParse(skillArg);
    if (!result.success) {
      const errorMessage = result.error.issues[0]?.message ?? 'Invalid skill format';
      console.error(chalk.red(errorMessage));
      console.error(chalk.gray('Example: mycompany/hello-world'));
      process.exit(1);
    }

    const { source, skillName } = result.data;
    await installSkill(source, skillName);

    console.log(chalk.green(`✓ Installed zanat.${source}.${skillName}`));
  } catch (error) {
    if (error instanceof Error) {
      console.error(chalk.red('Failed to install:'), error.message);
    } else {
      console.error(chalk.red('Failed to install:'), error);
    }
    process.exit(1);
  }
};
