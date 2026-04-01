import { Chalk } from './chalk.js';
import { Log } from './log.js';

export const Node = {
  checkVersion(requiredMajor: number): void {
    const currentMajor = parseInt(process.versions.node.split('.')[0] ?? '', 10);

    if (isNaN(currentMajor)) {
      Log.msg(Chalk.red('Could not determine the current Node.js version. Is Node.js installed?'), {
        prefix: '✗',
      });
      process.exit(1);
    }

    if (currentMajor < requiredMajor) {
      Log.msg(
        Chalk.red(
          `Zanat requires Node.js ${requiredMajor} or higher. You are running Node.js ${process.versions.node}. Visit nodejs.org to upgrade.`
        ),
        { prefix: '✗' }
      );
      process.exit(1);
    }
  },
} as const;
