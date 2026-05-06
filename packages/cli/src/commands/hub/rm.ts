import { Config, Fs, Log, Prompt, Chalk } from '@iamramo/zanat-core';

export const hubRmCommand = async (hubName: string): Promise<void> => {
  const full = await Config.get();

  if (!full.hubs[hubName]) {
    throw new Error(`Hub '${hubName}' not found.`);
  }

  if (full.activeHub === hubName) {
    throw new Error(
      `Cannot remove the active hub. Switch to another hub first with 'zanat hub switch <name>'.`
    );
  }

  const hub = full.hubs[hubName]!;

  const confirmed = await Prompt.confirm({
    message: `Remove hub '${hubName}' (${hub.url})? The hub directory will be deleted.`,
    default: false,
  });

  if (!confirmed) {
    Log.blank();
    Log.msg(Chalk.blue('Cancelled.'));
    return;
  }

  // Remove hub directory
  const dirExists = await Fs.exists(hub.dir);
  if (dirExists) {
    await Fs.remove(hub.dir);
    Log.msg(Chalk.green(`Removed ${hub.dir}`), { prefix: '✔' });
  }

  // Remove hub entry from config
  const { [hubName]: _, ...remainingHubs } = full.hubs;
  await Config.update({ ...full, hubs: remainingHubs });
  Log.msg(Chalk.green(`Removed hub '${hubName}' from config`), { prefix: '✔' });

  Log.blank();
  Log.msg(Chalk.white(Chalk.bold(`Hub '${hubName}' removed.`)), { prefix: '✨' });
};
