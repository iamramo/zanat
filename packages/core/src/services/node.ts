import { Chalk } from './chalk.js';
import { Log } from './log.js';

const REQUIRED_MAJOR = 22;

export const Node = {
  checkVersion(): void {
    const [major] = process.versions.node.split('.').map(Number);
    if ((major ?? 0) < REQUIRED_MAJOR) {
      Log.msg(
        Chalk.red(
          `Zanat requires Node.js ${REQUIRED_MAJOR} or higher. You are running Node.js ${process.versions.node}. Visit nodejs.org to upgrade.`,
        ),
        { prefix: '✗' },
      );
      process.exit(1);
    }
  },
} as const;
