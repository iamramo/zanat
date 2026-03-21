import { searchSkills, logger } from '@iamramo/zanat-core';
import chalk from 'chalk';
import { ensureHubExists } from '../utils/validation.js';

const ELLIPSIS = '...';

const truncateDescription = (description: string, maxLength = 256): string => {
  if (description.length <= maxLength) return description;

  const lastSpace = description.lastIndexOf(' ', maxLength - ELLIPSIS.length);
  if (lastSpace === -1) {
    return description.slice(0, maxLength - ELLIPSIS.length) + ELLIPSIS;
  }
  return description.slice(0, lastSpace) + ELLIPSIS;
};

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
      console.log(chalk.green('•'), skill.fullName);
      const truncatedDesc = truncateDescription(skill.description);
      logger.dim(`  ${truncatedDesc}`);
      logger.blank();
    });

    logger.dim(`Found ${results.length} skill${results.length === 1 ? '' : 's'}`);
    logger.blank();
    logger.dim('Add a skill with: zanat add <namespace.skill-name>');
  } catch (error) {
    logger.error('Failed to search', error);
    process.exit(1);
  }
};
