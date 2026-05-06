import path from 'node:path';
import {
  Path,
  Config,
  Fs,
  Git,
  LockFile,
  Log,
  Prompt,
  Zod,
  Chalk,
} from '@iamramo/zanat-core';

export const hubAddCommand = async (): Promise<void> => {
  Log.msg(Chalk.blue('Adding a hub...'));
  Log.blank();

  const isFirstHub = !(await Config.exists());

  // Step 1: Collect configuration from user
  const existingHubs = isFirstHub ? {} : (await Config.get()).hubs;

  const hubName = await Prompt.input({
    message: 'Hub name:',
    default: 'default',
    validate: (value: string) => {
      if (!value || value.trim().length === 0) return 'Hub name is required';
      if (existingHubs[value]) return `Hub '${value}' already exists`;
      return true;
    },
  });

  const hubUrl = await Prompt.input({
    message: 'Hub repository URL:',
    required: true,
    validate: async (value: string) => {
      const formatResult = Prompt.validate(Zod.config.HubSchema.shape.url)(value);
      if (formatResult !== true) return formatResult;

      try {
        const reachable = await Git.isReachable(value);
        if (!reachable) {
          return `Cannot access repository '${value}'. Check the URL and your permissions.`;
        }
      } catch (error) {
        Log.debug(error);
        return `Cannot access repository '${value}'. Check the URL and your permissions.`;
      }

      return true;
    },
  });

  const hubBranch = await Prompt.input({
    message: 'Hub branch:',
    default: 'main',
    validate: async (value: string) => {
      const formatResult = Prompt.validate(Zod.config.HubSchema.shape.branch)(value);
      if (formatResult !== true) return formatResult;

      const remoteBranchExists = await Git.remoteBranchExists(value, hubUrl);
      if (!remoteBranchExists) {
        return `Branch '${value}' does not exist in the repository`;
      }

      return true;
    },
  });

  const hubDir = await Prompt.input({
    message: 'Hub directory path:',
    default: Path.getDefaultHubDir(hubName),
    validate: async (value: string) => {
      const formatResult = Prompt.validate(Zod.config.HubSchema.shape.dir)(value);
      if (formatResult !== true) return formatResult;

      const parentDir = path.dirname(value);
      await Fs.ensureDir(parentDir);
      const hasWriteAccess = await Fs.access(parentDir, 'W_OK');
      if (!hasWriteAccess) {
        return `Cannot write to '${value}'. Check your permissions.`;
      }

      return true;
    },
  });

  // Step 2: Create directories, config, and clone
  try {
    Log.blank();
    Log.msg(Chalk.blue('Setting up directories...'));

    await Fs.ensureDir(Path.ZANAT_DIR);
    Log.msg(Chalk.green(`Created ${Path.ZANAT_DIR}`), { prefix: '✔' });

    await Fs.ensureDir(Path.AGENTS_DIR);
    Log.msg(Chalk.green(`Created ${Path.AGENTS_DIR}`), { prefix: '✔' });

    await Fs.ensureDir(Path.AGENTS_SKILLS_DIR);
    Log.msg(Chalk.green(`Created ${Path.AGENTS_SKILLS_DIR}`), { prefix: '✔' });

    if (isFirstHub) {
      await LockFile.create();
      Log.msg(Chalk.green(`Created ${Path.SKILL_LOCK_FILE}`), { prefix: '✔' });
    }

    const newHubEntry = {
      url: hubUrl,
      branch: hubBranch,
      dir: hubDir,
      lastPull: new Date().toISOString(),
    };

    const newFullConfig = isFirstHub
      ? { version: 1 as const, activeHub: hubName, hubs: { [hubName]: newHubEntry } }
      : { ...(await Config.get()), hubs: { ...existingHubs, [hubName]: newHubEntry } };

    await Config.update(newFullConfig);
    Log.msg(Chalk.green(`Updated ${Path.CONFIG_FILE}`), { prefix: '✔' });
    Log.blank();

    // Handle existing hub directory
    const hubDirExists = await Fs.exists(hubDir);
    const hubDirEmpty = hubDirExists && (await Fs.isEmptyDir(hubDir));

    if (hubDirExists && !hubDirEmpty) {
      const shouldReplace = await Prompt.confirm({
        message: `Directory '${hubDir}' already exists and is not empty. Replace it?`,
        default: false,
      });

      if (!shouldReplace) {
        Log.blank();
        Log.msg(Chalk.blue('Cancelled.'));
        return;
      }

      await Fs.remove(hubDir);
      Log.blank();
    }

    Log.msg(Chalk.blue('Cloning hub repository...'));
    await Git.clone(hubUrl, hubBranch, hubDir);
    Log.msg(Chalk.green(`Cloned hub from branch ${hubBranch} to "${hubDir}"`), { prefix: '✔' });
  } catch (error) {
    Log.blank();
    Log.msg(Chalk.red('Failed to add hub. Cleaning up...'), { prefix: '✗' });
    if (isFirstHub) {
      await Fs.remove(Path.ZANAT_DIR);
    }
    Log.debug(error);
    throw error;
  }

  Log.blank();
  Log.msg(Chalk.white(Chalk.bold(`Hub '${hubName}' added successfully!`)), { prefix: '✨' });
};
