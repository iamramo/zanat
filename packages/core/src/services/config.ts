import { Path } from './path.js';
import { Fs } from './fs.js';
import { Format } from './format.js';
import { Log } from './log.js';
import { Chalk } from './chalk.js';
import { Git } from './git.js';
import { Prompt } from './prompt.js';
import { type IConfig, type IHubConfig } from '../schemas/config.js';
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
    const result = Zod.config.HubSchema.safeParse(config);
    if (!result.success) {
      const errorMessage = result.error.issues[0]?.message ?? 'Invalid configuration values';
      throw new Error(
        `Invalid config at ${Path.CONFIG_FILE}: ${errorMessage}. Run 'zanat init' to reconfigure.`
      );
    }

    if (!remote) return;

    const refType = await Git.getRefType(config.branch);
    if (refType !== 'branch') {
      throw new Error(
        `'${config.branch}' is not a branch. The hub branch must reference a valid branch.`
      );
    }

    const branchExists = await Git.remoteBranchExists(config.branch);
    if (!branchExists) {
      throw new Error(`Branch '${config.branch}' does not exist in hub '${config.url}'.`);
    }
  },

  async get(): Promise<IHubConfig> {
    try {
      const content = await Fs.readFile(Path.CONFIG_FILE);
      const parsed = JSON.parse(content) as IConfig;
      const validated = Zod.config.ConfigSchema.parse(parsed);
      const hub = Zod.config.HubSchema.parse(validated.hubs['default']);
      return hub;
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to read the config.');
    }
  },

  async update(config: IHubConfig): Promise<void> {
    try {
      const validated = Zod.config.HubSchema.parse(config);
      const full: IConfig = {
        version: 1,
        hubs: { default: validated },
      };
      await Fs.writeFile(Path.CONFIG_FILE, Format.json(full));
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to update the config.');
    }
  },

  async ensureOnHubBranch(): Promise<void> {
    const config = await this.get();
    const currentBranch = await Git.getCurrentBranch();

    if (currentBranch === config.branch) {
      return;
    }

    // Branch mismatch detected
    Log.msg(Chalk.yellow(`Hub is on '${currentBranch}' but config tracks '${config.branch}'`), {
      prefix: '⚠',
    });
    Log.blank();

    const shouldSwitch = await Prompt.confirm({
      message: `Switch to '${config.branch}' and proceed?`,
      default: true,
    });

    if (!shouldSwitch) {
      Log.msg(Chalk.blue('Cancelled.'));
      process.exit(0);
    }

    // Try to switch
    try {
      await Git.checkout(config.branch);
      Log.msg(Chalk.green(`Switched to '${config.branch}'`), { prefix: '✔' });
      Log.blank();
    } catch (error) {
      Log.debug(error);
      Log.msg(Chalk.red(`Failed to switch to '${config.branch}'`), { prefix: '✗' });
      Log.msg(Chalk.gray(`Please fix manually in '${config.dir}'.`));
      process.exit(1);
    }
  },
} as const;
