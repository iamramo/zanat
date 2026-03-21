import {
  addSkill,
  updateSkill,
  skillExists,
  logger,
  confirm,
} from '@iamramo/zanat-core';
import { validateSkillArg, ensureHubExists } from '../utils/validation.js';

interface AddOptions {
  commit?: string;
}

const validateCommitSha = (sha: string): void => {
  if (!/^[a-f0-9]{7,40}$/i.test(sha)) {
    throw new Error('Invalid commit SHA format. Use at least 7 hexadecimal characters.');
  }
};

export const addCommand = async (skillArg: string, options: AddOptions): Promise<void> => {
  logger.info(`Adding skill: ${skillArg}...`);

  try {
    await ensureHubExists();
    const { namespace, skillName } = validateSkillArg(skillArg);

    if (options.commit) {
      validateCommitSha(options.commit);
    }

    const exists = await skillExists(namespace, skillName);
    if (exists) {
      if (options.commit) {
        logger.error(`Skill ${skillArg} is already added. Use \`zanat update\` to change the pinned version.`);
        process.exit(1);
      }

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

    await addSkill(namespace, skillName, options.commit);
    logger.success(`Added ${skillArg}${options.commit ? ` (pinned to ${options.commit.slice(0, 7)})` : ''}`);
  } catch (error) {
    logger.error('Failed to add', error);
    process.exit(1);
  }
};
