import {
  addSkill,
  updateSkill,
  skillExists,
  logger,
  confirm,
} from '@iamramo/zanat-core';
import { validateSkillArg, ensureHubExists } from '../utils/validation.js';

export const addCommand = async (skillArg: string): Promise<void> => {
  logger.info(`Adding skill: ${skillArg}...`);

  try {
    await ensureHubExists();
    const { namespace, skillName } = validateSkillArg(skillArg);

    const exists = await skillExists(namespace, skillName);
    if (exists) {
      const shouldUpdate = await confirm({
        message: `Skill ${skillArg} is already added. Update from hub?`,
        default: true,
      });

      if (!shouldUpdate) {
        logger.info('Cancelled');
        return;
      }

      await updateSkill(namespace, skillName);
      logger.success(`Updated ${skillArg}`);
      return;
    }

    await addSkill(namespace, skillName);
    logger.success(`Added ${skillArg}`);
  } catch (error) {
    logger.error('Failed to add', error);
    process.exit(1);
  }
};
