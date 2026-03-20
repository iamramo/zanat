import { searchSkills } from '../lib/search.js';
import { isHubCloned } from '../lib/git.js';
import chalk from 'chalk';

export async function searchCommand(query?: string): Promise<void> {
  try {
    const hubExists = await isHubCloned();
    if (!hubExists) {
      console.error(chalk.red('Hub not found. Run `zanat init` first.'));
      process.exit(1);
    }

    if (query) {
      console.log(chalk.blue(`Searching for: "${query}"...`));
    } else {
      console.log(chalk.blue('Available skills:'));
    }
    console.log();

    const results = await searchSkills(query);

    if (results.length === 0) {
      console.log(chalk.gray('No skills found.'));
      return;
    }

    results.forEach((skill) => {
      console.log(chalk.green('•'), `${skill.source}/${skill.name}`);
      console.log(chalk.gray(`  ${skill.description}`));
      console.log();
    });

    console.log(chalk.gray(`Found ${results.length} skill${results.length === 1 ? '' : 's'}`));
    console.log();
    console.log(chalk.gray('Install a skill with: zanat install <source>/<skill-name>'));
  } catch (error) {
    console.error(chalk.red('Failed to search:'), error);
    process.exit(1);
  }
}
