import { searchSkills } from '@iamramo/zanat-core';
import chalk from 'chalk';
import { logger } from '../utils/logger.js';
import { ensureHubExists } from '../utils/validation.js';

export const searchCommand = async (query?: string): Promise<void> => {
  try {
    await ensureHubExists();

    if (query) {
      logger.info(`Searching for: "${query}"...`);
    } else {
      logger.info('Available skills:');
    }
    logger.blank();

    const results = await searchSkills(query);

    if (results.length === 0) {
      logger.dim('No skills found.');
      return;
    }

    results.forEach((skill) => {
      console.log(chalk.green('•'), `${skill.source}/${skill.name}`);
      logger.dim(`  ${skill.description}`);
      logger.blank();
    });

    logger.dim(`Found ${results.length} skill${results.length === 1 ? '' : 's'}`);
    logger.blank();
    logger.dim('Add a skill with: zanat add <source>/<skill-name>');
  } catch (error) {
    logger.error('Failed to search', error);
    process.exit(1);
  }
};
