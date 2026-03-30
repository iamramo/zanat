import path from 'node:path';
import {
  Path,
  Config,
  Fs,
  Git,
  LockFile,
  Log,
  Format,
  Prompt,
  Zod,
  Chalk,
} from '@iamramo/zanat-core';

export const initCommand = async (): Promise<void> => {
  Log.msg(Chalk.blue('Initializing Zanat...'));
  Log.blank();

  let shouldReinitialize = false;

  // Step 1: Check for existing configuration and handle reinitialization
  const hasConfig = await Config.exists();
  if (hasConfig) {
    Log.msg(Chalk.blue('Zanat is already initialized.'));
    Log.blank();

    const config = await Config.get();
    Log.msg(Chalk.bold(`Repository: `) + Chalk.green(config.hubUrl), { prefix: '•', spacing: 2 });
    Log.msg(Chalk.bold(`Branch: `) + Chalk.green(config.hubBranch), { prefix: '•', spacing: 2 });
    Log.msg(Chalk.bold(`Directory: `) + Chalk.green(config.hubDir), { prefix: '•', spacing: 2 });
    Log.blank();

    shouldReinitialize = await Prompt.confirm({
      message: 'Reinitialize? Your hub directory will be replaced but added skills stay safe.',
      default: false,
    });

    if (!shouldReinitialize) {
      Log.blank();
      Log.msg(Chalk.blue('Keeping existing setup.'));
      return;
    }

    Log.blank();
  }

  // Step 2: Collect configuration from user
  const hubUrl = await Prompt.input({
    message: 'Hub repository URL:',
    required: true,
    validate: async (value: string) => {
      // Validate format
      const formatResult = Prompt.validate(Zod.config.ConfigSchema.shape.hubUrl)(value);
      if (formatResult !== true) {
        return formatResult;
      }

      // Validate repository access
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
      // Validate format
      const formatResult = Prompt.validate(Zod.config.ConfigSchema.shape.hubBranch)(value);
      if (formatResult !== true) {
        return formatResult;
      }

      // Validate branch existence on remote
      const remoteBranchExists = await Git.remoteBranchExists(value, hubUrl);
      if (!remoteBranchExists) {
        return `Branch '${value}' does not exist in the repository`;
      }

      return true;
    },
  });

  const hubDir = await Prompt.input({
    message: 'Hub directory path:',
    default: Path.HUB_DIR,
    validate: async (value: string) => {
      // Validate format
      const formatResult = Prompt.validate(Zod.config.ConfigSchema.shape.hubDir)(value);
      if (formatResult !== true) {
        return formatResult;
      }

      // Validate write permissions
      const parentDir = path.dirname(value);
      await Fs.ensureDir(parentDir);
      const hasWriteAccess = await Fs.access(parentDir, 'W_OK');
      if (!hasWriteAccess) {
        return `Cannot write to '${value}'. Check your permissions.`;
      }

      return true;
    },
  });

  const oldHubDir = shouldReinitialize ? (await Config.get()).hubDir : undefined;

  // Step 3: Create directories, config files, and clone repository
  try {
    Log.blank();
    Log.msg(Chalk.blue('Setting up directories...'));

    await Fs.ensureDir(Path.ZANAT_DIR);
    Log.msg(Chalk.green(`Created ${Path.ZANAT_DIR}`), { prefix: '✔' });

    await Fs.ensureDir(Path.AGENTS_DIR);
    Log.msg(Chalk.green(`Created ${Path.AGENTS_DIR}`), { prefix: '✔' });

    await Fs.emptyDir(Path.AGENTS_SKILLS_DIR);
    Log.msg(Chalk.green(`Created ${Path.AGENTS_SKILLS_DIR}`), { prefix: '✔' });

    await LockFile.create();
    Log.msg(Chalk.green(`Created ${Path.SKILL_LOCK_FILE}`), { prefix: '✔' });

    await Fs.writeFile(
      Path.CONFIG_FILE,
      Format.json({
        hubUrl,
        hubBranch,
        hubDir,
        lastPull: new Date().toISOString(),
      })
    );
    Log.msg(Chalk.green(`Created ${Path.CONFIG_FILE}`), { prefix: '✔' });
    Log.blank();

    // Remove old hub directory right before clone so earlier failures don't lose data
    if (oldHubDir) {
      Log.msg(Chalk.blue('Removing existing hub...'));
      await Fs.remove(oldHubDir);
      Log.msg(Chalk.green('Removed existing hub'), { prefix: '✔' });
      Log.blank();
    }

    Log.msg(Chalk.blue('Cloning hub repository...'));
    await Git.clone(hubUrl, hubBranch, hubDir);
    Log.msg(Chalk.green(`Cloned hub from branch ${hubBranch} to "${hubDir}"`), { prefix: '✔' });
  } catch (error) {
    // Clean up partial state on failure
    Log.blank();
    Log.msg(Chalk.red('Initialization failed. Cleaning up...'), { prefix: '✗' });
    await Fs.remove(Path.ZANAT_DIR);
    Log.debug(error);
    throw error;
  }

  Log.blank();
  Log.msg(Chalk.white(Chalk.bold('Zanat initialized successfully!')), { prefix: '✨' });
};
