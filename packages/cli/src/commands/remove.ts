import { removeSkill, logger } from '@iamramo/zanat-core';
import { validateSkillArg, ensureHubExists } from '../utils/validation.js';

export const removeCommand = async (skillArg: string): Promise<void> => {
  logger.info(`Removing skill: ${skillArg}...`);

  try {
    await ensureHubExists();
    const { namespace, skillName } = validateSkillArg(skillArg);
    await removeSkill(namespace, skillName);

    logger.success(`Removed ${skillArg}`);
  } catch (error) {
    logger.error('Failed to remove', error);
    process.exit(1);
  }
};
