import { Path } from './path.js';
import { Fs } from './fs.js';
import { Format } from './format.js';
import { Log } from './log.js';
import { Chalk } from './chalk.js';
import { Git } from './git.js';
import { Prompt } from './prompt.js';
import { type IConfig } from '../schemas/config.js';
import { Zod } from './zod.js';

export const Config = {
  async exists(): Promise<boolean> {
    return Fs.exists(Path.CONFIG_FILE);
  },
  async validate({ remote = true }: { remote?: boolean } = {}): Promise<void> {
    // Check if exists
    const config = await this.get().catch(() => undefined);
    if (!config) {
      throw new Error(`Config not found at ${Path.CONFIG_FILE}. Run 'zanat init' first.`);
    }

    // Contains all required values
    const result = Zod.config.ConfigSchema.safeParse(config);
    if (!result.success) {
      const errorMessage = result.error.errors[0]?.message ?? 'Invalid configuration values';
      throw new Error(
        `Invalid config at ${Path.CONFIG_FILE}: ${errorMessage}. Run 'zanat init' to reconfigure.`
      );
    }

    if (!remote) return;

    const refType = await Git.getRefType(config.hubBranch);
    if (refType !== 'branch') {
      throw new Error(
        `'${config.hubBranch}' is not a branch. The hubBranch must reference a valid branch.`
      );
    }

    const branchExists = await Git.remoteBranchExists(config.hubBranch);
    if (!branchExists) {
      throw new Error(`Branch '${config.hubBranch}' does not exist in hub '${config.hubUrl}'.`);
    }
  },
  async get(): Promise<IConfig> {
    try {
      const content = await Fs.readFile(Path.CONFIG_FILE);
      const parsed = JSON.parse(content);
      return Zod.config.ConfigSchema.parse(parsed);
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to read the config.');
    }
  },

  async update(config: IConfig): Promise<void> {
    try {
      const validated = Zod.config.ConfigSchema.parse(config);
      await Fs.writeFile(Path.CONFIG_FILE, Format.json(validated));
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to update the config.');
    }
  },

  async ensureOnHubBranch(): Promise<void> {
    const config = await this.get();
    const currentBranch = await Git.getCurrentBranch();

    if (currentBranch === config.hubBranch) {
      return;
    }

    // Branch mismatch detected
    Log.msg(Chalk.yellow(`Hub is on '${currentBranch}' but config tracks '${config.hubBranch}'`), {
      prefix: '⚠',
    });
    Log.blank();

    const shouldSwitch = await Prompt.confirm({
      message: `Switch to '${config.hubBranch}' and proceed?`,
      default: true,
    });

    if (!shouldSwitch) {
      Log.msg(Chalk.blue('Cancelled.'));
      process.exit(0);
    }

    // Try to switch
    try {
      await Git.checkout(config.hubBranch);
      Log.msg(Chalk.green(`Switched to '${config.hubBranch}'`), { prefix: '✔' });
      Log.blank();
    } catch (error) {
      Log.debug(error);
      Log.msg(Chalk.red(`Failed to switch to '${config.hubBranch}'`), { prefix: '✗' });
      Log.msg(Chalk.gray(`Please fix manually in '${config.hubDir}'.`));
      process.exit(1);
    }
  },
} as const;
