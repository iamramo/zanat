import { installSkill } from '../lib/skills.js';
import { isHubCloned } from '../lib/git.js';
import { SkillArgSchema } from '../schemas/skill-arg.js';
import chalk from 'chalk';

export async function installCommand(skillArg: string): Promise<void> {
  console.log(chalk.blue(`Installing skill: ${skillArg}...`));

  try {
    const hubExists = await isHubCloned();
    if (!hubExists) {
      console.error(chalk.red('Hub not found. Run `zanat init` first.'));
      process.exit(1);
    }

    // Validate skill argument using Zod schema
    const result = SkillArgSchema.safeParse(skillArg);
    if (!result.success) {
      const errorMessage = result.error.issues[0]?.message ?? 'Invalid skill format';
      console.error(chalk.red(errorMessage));
      console.error(chalk.gray('Example: mycompany/hello-world'));
      process.exit(1);
    }

    // Parse validated skill argument
    const [source, skillName] = skillArg.split('/') as [string, string];
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
}
