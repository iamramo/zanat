import path from 'node:path';
import { Path, Config, Fs, Git, LockFile, Log, Format, Prompt, Zod } from '@iamramo/zanat-core';

export const initCommand = async (): Promise<void> => {
  Log.blue('Initializing Zanat...');
  Log.blank();

  // Step 1: Check for existing configuration and handle reinitialization
  const hasConfig = await Config.exists();
  if (hasConfig) {
    Log.blue('Zanat is already initialized.');
    Log.blank();

    const config = await Config.get();
    Log.status(`Repository:`, config.hubUrl, 'green', { prefix: '•', spacing: 2 });
    Log.status(`Branch:`, config.hubBranch, 'green', { prefix: '•', spacing: 2 });
    Log.status(`Directory:`, config.hubDir, 'green', { prefix: '•', spacing: 2 });
    Log.blank();

    const shouldReinitialize = await Prompt.confirm({
      message: 'Reinitialize? Your hub directory will be replaced but added skills stay safe.',
      default: false,
    });

    if (!shouldReinitialize) {
      Log.blank();
      Log.blue('Keeping existing setup.');
      return;
    }

    Log.blank();
    Log.blue('Removing existing hub...');
    await Fs.remove(config.hubDir);
    Log.green('Removed existing hub', { prefix: '✓' });
    Log.blank();
  }

  // Step 2: Collect configuration from user
  const hubUrl = await Prompt.input({
    message: 'Hub repository URL:',
    required: true,
    validate: Prompt.validate(Zod.config.ConfigSchema.shape.hubUrl),
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
      try {
        await Git.lsRemote(hubUrl, value);
      } catch (error) {
        Log.debug(error);
        return `Branch '${value}' does not exist in the repository`;
      }

      return true;
    },
  });

  const hubDir = await Prompt.input({
    message: 'Hub directory path:',
    default: path.join(Path.ZANAT_DIR, 'hub'),
    validate: Prompt.validate(Zod.config.ConfigSchema.shape.hubDir),
  });

  // Step 3: Create directories and config files
  Log.blank();
  Log.blue('Setting up directories...');

  await Fs.ensureDir(Path.ZANAT_DIR);
  Log.green(`Created ${Path.ZANAT_DIR}`, { prefix: '✓' });

  await Fs.ensureDir(Path.AGENTS_DIR);
  Log.green(`Created ${Path.AGENTS_DIR}`, { prefix: '✓' });

  await LockFile.ensure();
  Log.green(`Created ${Path.SKILL_LOCK_FILE}`, { prefix: '✓' });

  await Fs.writeFile(
    Path.CONFIG_FILE,
    Format.json({
      hubUrl,
      hubBranch,
      hubDir,
      lastPull: new Date().toISOString(),
    })
  );
  Log.green(`Created ${Path.CONFIG_FILE}`, { prefix: '✓' });
  Log.blank();

  // Step 4: Clone repository
  Log.blue('Cloning hub repository...');
  await Git.clone(hubUrl, hubBranch, hubDir);
  Log.green(`Cloned hub from branch ${hubBranch} to "${hubDir}"`, { prefix: '✓' });

  Log.blank();
  Log.white(Log.bold('Zanat initialized successfully!'), { prefix: '✨' });
};
