import type { ZanatConfig } from '../types/index.js';
import { CONFIG_FILE } from '../utils/paths.js';
import { ENV } from '../config/env.js';
import fs from 'fs-extra';
import path from 'node:path';

export const loadConfig = async (): Promise<ZanatConfig | null> => {
  try {
    const exists = await fs.pathExists(CONFIG_FILE);
    if (!exists) {
      return null;
    }
    const content = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (ENV.DEBUG) {
      console.warn('[zanat] Failed to load config:', error);
    }
    return null;
  }
};

export const saveConfig = async (config: ZanatConfig): Promise<void> => {
  await fs.ensureDir(path.dirname(CONFIG_FILE));
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
};

export const getDefaultConfig = (): ZanatConfig => {
  return {
    hubUrl: 'https://github.com/iamramo/zanat-hub.git',
    hubBranch: 'main',
  };
};
