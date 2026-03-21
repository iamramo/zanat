import { installSkill } from '@iamramo/zanat-core';
import { logger } from '../utils/logger.js';
import { validateSkillArg, ensureHubExists } from '../utils/validation.js';

export const addCommand = async (skillArg: string): Promise<void> => {
  logger.info(`Adding skill: ${skillArg}...`);

  try {
    await ensureHubExists();
    const { source, skillName } = validateSkillArg(skillArg);
    await installSkill(source, skillName);

    logger.success(`Added zanat.${source}.${skillName}`);
  } catch (error) {
    logger.error('Failed to add', error);
    process.exit(1);
  }
};
