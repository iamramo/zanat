import { Config, Log, Chalk } from '@iamramo/zanat-core';

export const hubSwitchCommand = async (hubName: string): Promise<void> => {
  if (!(await Config.exists())) {
    Log.msg(Chalk.red("No hubs configured. Run 'zanat hub add' first."), { prefix: '✗' });
    process.exit(1);
  }

  const full = await Config.get();

  if (!full.hubs[hubName]) {
    Log.msg(Chalk.red(`Hub '${hubName}' not found. Use 'zanat hub list' to see available hubs.`), { prefix: '✗' });
    process.exit(1);
  }

  if (full.activeHub === hubName) {
    Log.msg(Chalk.blue(`Hub '${hubName}' is already active.`));
    return;
  }

  await Config.update({ ...full, activeHub: hubName });

  Log.msg(Chalk.green(`Switched to hub '${hubName}'`), { prefix: '✔' });
};
