import { getAddedSkills } from '@iamramo/zanat-core';
import chalk from 'chalk';
import { logger } from '../utils/logger.js';

export const listCommand = async (): Promise<void> => {
  try {
    const skills = await getAddedSkills();

    if (skills.length === 0) {
      logger.dim('No skills added.');
      logger.dim('Run `zanat search` to find skills or `zanat add <skill>` to add one.');
      return;
    }

    logger.info('Added skills:');
    logger.blank();

    skills.forEach((skill: string) => {
      console.log(chalk.green('•'), skill);
    });

    logger.blank();
    logger.dim(`Total: ${skills.length} skill${skills.length === 1 ? '' : 's'}`);
  } catch (error) {
    logger.error('Failed to list skills', error);
    process.exit(1);
  }
};
