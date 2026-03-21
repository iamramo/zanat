import { isHubCloned, logger } from '@iamramo/zanat-core';
import { SkillArgSchema, type SkillArg } from '../schemas/skill-arg.js';

export const validateSkillArg = (skillArg: string): SkillArg => {
  const result = SkillArgSchema.safeParse(skillArg);
  if (!result.success) {
    const errorMessage = result.error.issues[0]?.message ?? 'Invalid skill format';
    logger.error(errorMessage);
    logger.dim('Example: mycompany.hello-world or mycompany.team.hello-world');
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
