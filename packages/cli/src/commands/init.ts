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
import chalk from 'chalk';

export const initCommand = async (): Promise<void> => {
  console.log(chalk.blue('Initializing Zanat...\n'));

  try {
    const hubUrl = await input({
      message: 'Hub repository URL:',
      default: 'https://github.com/iamramo/zanat-hub.git',
    });

    const hubBranch = await input({
      message: 'Hub branch:',
      default: 'main',
    });

    console.log(chalk.blue('\nSetting up directories...'));

    await fs.ensureDir(ZANAT_DIR);
    console.log(chalk.green(`✓ Created ${ZANAT_DIR}`));

    const config = {
      hubUrl,
      hubBranch,
    };
    await saveConfig(config);
    console.log(chalk.green(`✓ Created config`));

    await fs.ensureDir(AGENTS_DIR);

    const hubExists = await isHubCloned();
    if (!hubExists) {
      console.log(chalk.blue('Cloning hub repository...'));
      await cloneHub(config.hubUrl, config.hubBranch);
      console.log(chalk.green(`✓ Cloned hub to ${HUB_DIR}`));
    } else {
      console.log(chalk.yellow('Hub already exists, skipping clone'));
    }

    console.log(chalk.green('\n✨ Zanat initialized successfully!'));
    console.log(chalk.gray(`\nNext steps:`));
    console.log(chalk.gray(`  zanat sync        - Update skills from hub`));
    console.log(chalk.gray(`  zanat search      - Find available skills`));
    console.log(chalk.gray(`  zanat install     - Install a skill`));
  } catch (error) {
    console.error(chalk.red('Failed to initialize:'), error);
    process.exit(1);
  }
};
