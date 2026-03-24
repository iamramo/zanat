import { Path } from './path.js';
import { Fs } from './fs.js';
import { Format } from './format.js';
import { Log } from './log.js';
import { Git } from './git.js';
import { Prompt } from './prompt.js';
import { type IConfig } from '../schemas/config.js';
import { Zod } from '../index.js';

export const Config = {
  async exists(): Promise<boolean> {
    return !!(await Config.get().catch(() => undefined));
  },
  async validate(): Promise<void> {
    // Check if exists
    const config = await this.get().catch(() => undefined);
    if (!config) {
      throw new Error('Config not found. Run `zanat init` first.');
    }

    // Contains all required values
    const result = Zod.config.ConfigSchema.safeParse(config);
    if (!result.success) {
      throw new Error('Invalid config.');
    }
  },
  async get(): Promise<IConfig> {
    try {
      const content = await Fs.readFile(Path.CONFIG_FILE);
      const parsed = JSON.parse(content);
      return Zod.config.ConfigSchema.parse(parsed);
    } catch (error) {
      Log.debug(error);
      throw new Error('Could not get the config.');
    }
  },

  async update(config: IConfig): Promise<void> {
    try {
      const validated = Zod.config.ConfigSchema.parse(config);
      await Fs.writeFile(Path.CONFIG_FILE, Format.json(validated));
    } catch (error) {
      Log.debug(error);
      throw new Error('Could not update the config.');
    }
  },

  async ensureOnTrackedBranch(): Promise<void> {
    const config = await this.get();
    const currentBranch = await Git.getCurrentBranch();

    if (currentBranch === config.hubBranch) {
      return;
    }

    // Branch mismatch detected
    Log.yellow(`Hub is on '${currentBranch}' but config tracks '${config.hubBranch}'`, {
      prefix: '⚠',
    });
    Log.blank();

    const shouldSwitch = await Prompt.confirm({
      message: `Switch to '${config.hubBranch}' and proceed?`,
      default: true,
    });

    if (!shouldSwitch) {
      Log.blue('Cancelled.');
      process.exit(0);
    }

    // Try to switch
    try {
      await Git.checkout(config.hubBranch);
      Log.green(`Switched to '${config.hubBranch}'`, { prefix: '✓' });
      Log.blank();
    } catch (error) {
      Log.debug(error);
      Log.red(`Failed to switch to '${config.hubBranch}'`, { prefix: '✗' });
      Log.gray(`Please fix manually in "${config.hubDir}"`);
      process.exit(1);
    }
  },
} as const;
