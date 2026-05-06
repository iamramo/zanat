import { Config, Log, Chalk } from '@iamramo/zanat-core';

export const hubSwitchCommand = async (hubName: string): Promise<void> => {
  const full = await Config.getAll();

  if (!full.hubs[hubName]) {
    throw new Error(`Hub '${hubName}' not found. Use 'zanat hub list' to see available hubs.`);
  }

  if (full.activeHub === hubName) {
    Log.msg(Chalk.blue(`Hub '${hubName}' is already active.`));
    return;
  }

  await Config.update({ ...full, activeHub: hubName });

  Log.msg(Chalk.green(`Switched to hub '${hubName}'`), { prefix: '✔' });
};
