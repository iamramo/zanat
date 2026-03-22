import { Path, Config, Fs, Git, LockFile, Log, Format, Prompt } from '@iamramo/zanat-core';

export const initCommand = async (): Promise<void> => {
  Log.blue('Initializing Zanat...');
  Log.blank();

  try {
    const existingConfig = await Config.get().catch(() => undefined);

    if (existingConfig) {
      Log.blue('Zanat is already initialized.');
      Log.blank();

      Log.blue(`Repository: ${existingConfig.hubUrl}`);
      Log.blue(`Branch: ${existingConfig.hubBranch}`);

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
      await Fs.remove(existingConfig.hubDir);
      Log.green('Removed existing hub', { prefix: '✓' });
      Log.blank();
    }

    const hubUrl = await Prompt.input({
      message: 'Hub repository URL:',
      required: true,
    });

    const hubBranch = await Prompt.input({
      message: 'Hub branch:',
      default: 'main',
    });

    const hubDir = await Prompt.input({
      message: 'Hub directory path:',
      default: `${Path.ZANAT_DIR}/hub`,
    });

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
        lastSync: new Date().toISOString(),
      })
    );
    Log.green(`Created ${Path.CONFIG_FILE}`, { prefix: '✓' });

    Log.blank();
    Log.blue('Cloning hub repository...');
    await Git.clone(hubUrl, hubBranch, hubDir);
    Log.green(`Cloned hub from branch ${hubBranch} to "${hubDir}"`, { prefix: '✓' });

    Log.blank();
    Log.green('Zanat initialized successfully!', { prefix: '✓' });
  } catch {
    Log.red('Failed to initialize', { prefix: '✗' });
    process.exit(1);
  }
};
