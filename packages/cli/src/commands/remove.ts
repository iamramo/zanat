import { removeSkill } from '@iamramo/zanat-core';
import { logger } from '../utils/logger.js';
import { validateSkillArg, ensureHubExists } from '../utils/validation.js';

export const removeCommand = async (skillArg: string): Promise<void> => {
  logger.info(`Removing skill: ${skillArg}...`);

  try {
    await ensureHubExists();
    const { source, skillName } = validateSkillArg(skillArg);
    await removeSkill(source, skillName);

    logger.success(`Removed zanat.${source}.${skillName}`);
  } catch (error) {
    logger.error('Failed to remove', error);
    process.exit(1);
  }
};
