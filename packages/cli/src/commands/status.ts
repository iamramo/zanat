import { getHubStatus, getAddedSkills, loadConfig, logger } from '@iamramo/zanat-core';
import chalk from 'chalk';

const formatLastSync = (lastSync?: string): string => {
  if (!lastSync) return 'Never';

  const last = new Date(lastSync);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  return last.toLocaleDateString();
};

export const statusCommand = async (): Promise<void> => {
  try {
    const hubStatus = await getHubStatus();
    const skills = await getAddedSkills();
    const config = await loadConfig();

    logger.info('Hub Status:');
    logger.blank();

    if (!hubStatus.initialized) {
      logger.dim('  Not initialized');
      logger.dim('  Run `zanat init` to set up');
      return;
    }

    console.log(chalk.green('•'), 'Initialized:', chalk.bold('yes'));

    if (hubStatus.remoteUrl) {
      console.log(chalk.green('•'), 'Repository:', chalk.bold(hubStatus.remoteUrl));
    }

    if (hubStatus.branch) {
      console.log(chalk.green('•'), 'Branch:', chalk.bold(hubStatus.branch));
    }

    console.log(chalk.green('•'), 'Last sync:', chalk.bold(formatLastSync(config?.lastSync)));

    if (hubStatus.behind > 0) {
      logger.warning(`Behind: ${hubStatus.behind} commit${hubStatus.behind === 1 ? '' : 's'}`);
    } else {
      console.log(chalk.green('•'), 'Behind: 0 commits (up-to-date)');
    }

    logger.blank();
    logger.info('Skills:');
    logger.blank();
    console.log(chalk.green('•'), 'Added:', chalk.bold(skills.length.toString()));

    if (skills.length > 0) {
      skills.forEach((skill: string) => {
        console.log('  ', chalk.dim('•'), skill);
      });
    }

    logger.blank();
  } catch (error) {
    logger.error('Failed to get status', error);
    process.exit(1);
  }
};
