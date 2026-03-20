import { installSkill } from '../lib/skills.js';
import { isHubCloned } from '../lib/git.js';
import chalk from 'chalk';

export async function installCommand(skillArg: string): Promise<void> {
  console.log(chalk.blue(`Installing skill: ${skillArg}...`));

  try {
    const hubExists = await isHubCloned();
    if (!hubExists) {
      console.error(chalk.red('Hub not found. Run `zanat init` first.'));
      process.exit(1);
    }

    // Parse skill argument (format: source/skill-name)
    const parts = skillArg.split('/');
    if (parts.length !== 2) {
      console.error(chalk.red('Invalid skill format. Use: source/skill-name'));
      console.error(chalk.gray('Example: yurchi/code-review'));
      process.exit(1);
    }

    const source = parts[0]!;
    const skillName = parts[1]!;
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
