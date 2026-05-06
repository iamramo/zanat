import { Config, Log, Chalk } from '@iamramo/zanat-core';

export const hubListCommand = async (): Promise<void> => {
  const full = await Config.get();
  const hubNames = Object.keys(full.hubs);

  if (hubNames.length === 0) {
    Log.msg(Chalk.blue('No hubs configured. Use \'zanat hub add\' to add one.'));
    return;
  }

  Log.blank();
  for (const name of hubNames) {
    const hub = full.hubs[name]!;
    const isActive = name === full.activeHub;
    const indicator = isActive ? Chalk.green('●') : Chalk.gray('○');
    const label = isActive ? Chalk.white(Chalk.bold(name)) : Chalk.white(name);

    Log.msg(`${indicator} ${label}`, { spacing: 2 });
    Log.msg(Chalk.gray(`  URL:       ${hub.url}`), { spacing: 4 });
    Log.msg(Chalk.gray(`  Branch:    ${hub.branch}`), { spacing: 4 });
    Log.msg(Chalk.gray(`  Directory: ${hub.dir}`), { spacing: 4 });
    Log.msg(Chalk.gray(`  Last pull: ${hub.lastPull}`), { spacing: 4 });
    Log.blank();
  }
};
