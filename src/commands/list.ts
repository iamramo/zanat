import { listInstalledSkills } from '../lib/skills';
import chalk from 'chalk';

export async function listCommand(): Promise<void> {
  console.log(chalk.blue('Installed skills:'));
  console.log();

  try {
    const skills = await listInstalledSkills();

    if (skills.length === 0) {
      console.log(chalk.gray('No skills installed.'));
      console.log(chalk.gray('Run `zanat search` to find skills or `zanat install <skill>` to install one.'));
      return;
    }

    skills.forEach(skill => {
      console.log(chalk.green('•'), skill);
    });

    console.log();
    console.log(chalk.gray(`Total: ${skills.length} skill${skills.length === 1 ? '' : 's'}`));
  } catch (error) {
    console.error(chalk.red('Failed to list skills:'), error);
    process.exit(1);
  }
}
