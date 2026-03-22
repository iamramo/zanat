import type { IConfig } from '../types/config.js';
import { Path } from '../path.js';
import { Fs } from './fs.js';
import { Format } from './format.js';

export const Config = {
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
