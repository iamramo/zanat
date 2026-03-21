import {
  ZANAT_DIR,
  HUB_DIR,
  AGENTS_DIR,
  CONFIG_FILE,
  saveConfig,
  cloneHub,
  isHubCloned,
  getHubStatus,
  loadConfig,
  logger,
  input,
  confirm,
} from '@iamramo/zanat-core';
import fs from 'fs-extra';

export const initCommand = async (): Promise<void> => {
  logger.info('Initializing Zanat...');
  logger.blank();

  try {
    const hubExists = await isHubCloned();

    if (hubExists) {
      const status = await getHubStatus();
      const config = await loadConfig();

      logger.info('Zanat is already initialized.');
      logger.blank();

      if (status.remoteUrl) {
        console.log(`Repository: ${status.remoteUrl}`);
      }
      if (status.branch) {
        console.log(`Branch: ${status.branch}`);
      }

      logger.blank();

      const shouldReinitialize = await confirm({
        message: 'Reinitialize? Your hub directory will be replaced but added skills stay safe.',
        default: false,
      });

      if (!shouldReinitialize) {
        logger.blank();
        logger.info('Keeping existing setup.');
        return;
      }

      logger.blank();
      logger.info('Removing existing hub...');
      await fs.remove(HUB_DIR);
      logger.success('Removed existing hub');
      logger.blank();
    }

    const hubUrl = await input({
      message: 'Hub repository URL:',
      default: 'https://github.com/iamramo/zanat-hub.git',
    });

    const hubBranch = await input({
      message: 'Hub branch:',
      default: 'main',
    });

    logger.blank();
    logger.info('Setting up directories...');

    await fs.ensureDir(ZANAT_DIR);
    logger.success(`Created ${ZANAT_DIR}`);

    const config = {
      hubUrl,
      hubBranch,
    };

    await fs.ensureDir(AGENTS_DIR);

    logger.blank();
    logger.info('Cloning hub repository...');
    const actualBranch = await cloneHub(hubUrl, hubBranch);
    if (actualBranch !== hubBranch) {
      config.hubBranch = actualBranch;
      logger.warning(`Branch '${hubBranch}' not found, using '${actualBranch}' instead`);
    }
    logger.success(`Cloned hub to ${HUB_DIR}`);

    await saveConfig(config);
    logger.success(`Created config.json in ${CONFIG_FILE}`);

    logger.blank();
    logger.success('Zanat initialized successfully!');
  } catch (error) {
    logger.error('Failed to initialize', error);
    process.exit(1);
  }
};
