import {
  ZANAT_DIR,
  HUB_DIR,
  AGENTS_DIR,
  saveConfig,
  cloneHub,
  isHubCloned,
} from '@iamramo/zanat-core';
import { input } from '@inquirer/prompts';
import fs from 'fs-extra';
import { logger } from '../utils/logger.js';

export const initCommand = async (): Promise<void> => {
  logger.info('Initializing Zanat...\n');

  try {
    const hubUrl = await input({
      message: 'Hub repository URL:',
      default: 'https://github.com/iamramo/zanat-hub.git',
    });

    const hubBranch = await input({
      message: 'Hub branch:',
      default: 'main',
    });

    logger.info('\nSetting up directories...');

    await fs.ensureDir(ZANAT_DIR);
    logger.success(`Created ${ZANAT_DIR}`);

    const config = {
      hubUrl,
      hubBranch,
    };

    await fs.ensureDir(AGENTS_DIR);

    const hubExists = await isHubCloned();
    if (!hubExists) {
      logger.info('Cloning hub repository...');
      const actualBranch = await cloneHub(hubUrl, hubBranch);
      if (actualBranch !== hubBranch) {
        config.hubBranch = actualBranch;
        logger.warning(`Branch '${hubBranch}' not found, using '${actualBranch}' instead`);
      }
      logger.success(`Cloned hub to ${HUB_DIR}`);
    } else {
      logger.warning('Hub already exists, skipping clone');
    }

    await saveConfig(config);
    logger.success(`Created config`);

    logger.success('\n✨ Zanat initialized successfully!');
    logger.dim(
      `\nNext steps:\n  zanat sync        - Update skills from hub\n  zanat search      - Find available skills\n  zanat add         - Add a skill`
    );
  } catch (error) {
    logger.error('Failed to initialize', error);
    process.exit(1);
  }
};
