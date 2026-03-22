import { Path } from '../path.js';
import { Fs } from './fs.js';
import { Format } from './format.js';
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
    const result = Zod.ConfigSchema.safeParse(config);
    if (!result.success) {
      throw new Error('Invalid config.');
    }
  },
  async get(): Promise<IConfig> {
    try {
      const content = await Fs.readFile(Path.CONFIG_FILE);
      return JSON.parse(content);
    } catch {
      throw new Error('Could not get the config.');
    }
  },

  async update(config: IConfig): Promise<void> {
    try {
      await Fs.writeFile(Path.CONFIG_FILE, Format.json(config));
    } catch {
      throw new Error('Could not update the config.');
    }
  },
} as const;
