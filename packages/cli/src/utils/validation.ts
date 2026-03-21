import { getHubStatus, isHubCloned } from '@iamramo/zanat-core';
import { SkillArgSchema, type SkillArg } from '../schemas/skill-arg.js';
import { logger } from './logger.js';

export const validateSkillArg = (skillArg: string): SkillArg => {
  const result = SkillArgSchema.safeParse(skillArg);
  if (!result.success) {
    const errorMessage = result.error.issues[0]?.message ?? 'Invalid skill format';
    logger.error(errorMessage);
    logger.dim('Example: mycompany/hello-world');
    process.exit(1);
  }
  return result.data;
};

export const ensureHubExists = async (): Promise<void> => {
  const hubExists = await isHubCloned();
  if (!hubExists) {
    logger.error('Hub not found. Run `zanat init` first.');
    process.exit(1);
  }
};

export const checkHubBehind = async (): Promise<void> => {
  try {
    const status = await getHubStatus();

    if (status.behind > 0) {
      logger.warning(
        `Your skills hub is ${status.behind} commit${status.behind === 1 ? '' : 's'} behind. Run 'zanat sync' to update.`
      );
      logger.blank();
    }
  } catch {}
};
