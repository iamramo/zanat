import { ZANAT_DIR, HUB_DIR, AGENTS_DIR } from '../utils/paths.js';
import { saveConfig, getDefaultConfig } from '../lib/config.js';
import { cloneHub, isHubCloned } from '../lib/git.js';
import fs from 'fs-extra';
import chalk from 'chalk';

export async function initCommand(): Promise<void> {
  console.log(chalk.blue('Initializing Zanat...'));

  try {
    // Create .zanat directory
    await fs.ensureDir(ZANAT_DIR);
    console.log(chalk.green(`✓ Created ${ZANAT_DIR}`));

    // Create config
    const config = getDefaultConfig();
    await saveConfig(config);
    console.log(chalk.green(`✓ Created config`));

    // Ensure .agents directory exists
    await fs.ensureDir(AGENTS_DIR);

    // Clone hub if not already cloned
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
}
