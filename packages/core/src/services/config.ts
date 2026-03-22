import type { ZanatConfig } from '../types/config.js';
import { Path } from '../paths.js';
import { Fs } from './fs.js';

export const Config = {
  async get(): Promise<ZanatConfig> {
    try {
      const content = await Fs.readFile(Path.CONFIG_FILE);
      return JSON.parse(content);
    } catch {
      throw new Error('Could not get the config.');
    }
  },

  async update(config: ZanatConfig): Promise<void> {
    try {
      await Fs.writeFile(Path.CONFIG_FILE, JSON.stringify(config, null, 2));
    } catch {
      throw new Error('Could not update the config.');
    }
  },
} as const;
