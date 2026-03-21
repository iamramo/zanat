import {
  updateSkill,
  updateAllSkills,
  getAddedSkills,
  logger,
  confirm,
} from '@iamramo/zanat-core';
import { validateSkillArg, ensureHubExists } from '../utils/validation.js';

interface UpdateOptions {
  yes?: boolean;
}

export const updateCommand = async (
  skillArg: string | undefined,
  options: UpdateOptions
): Promise<void> => {
  try {
    await ensureHubExists();

    if (skillArg) {
      // Update specific skill
      logger.info(`Updating skill: ${skillArg}...`);
      const { namespace, skillName } = validateSkillArg(skillArg);
      await updateSkill(namespace, skillName);
      logger.success(`Updated ${skillArg}`);
    } else {
      // Update all skills
      const addedSkills = await getAddedSkills();

      if (addedSkills.length === 0) {
        logger.info('No skills to update');
        return;
      }

      if (!options.yes) {
        const shouldUpdate = await confirm({
          message: `This will update ${addedSkills.length} skill(s). Continue?`,
          default: true,
        });

        if (!shouldUpdate) {
          logger.info('Update cancelled');
          return;
        }
      }

      logger.info(`Updating ${addedSkills.length} skill(s)...`);
      const { updated, failed } = await updateAllSkills();

      if (updated.length > 0) {
        logger.success(`Updated ${updated.length} skill(s)`);
        for (const skill of updated) {
          logger.success(`  ✓ ${skill}`);
        }
      }

      if (failed.length > 0) {
        logger.error(`Failed to update ${failed.length} skill(s)`);
        for (const { skill, error } of failed) {
          logger.error(`  ✗ ${skill}: ${error}`);
        }
        process.exit(1);
      }
    }
  } catch (error) {
    logger.error('Failed to update', error);
    process.exit(1);
  }
};
