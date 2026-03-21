import type { ZanatConfig } from '../types/index.js';
import { CONFIG_FILE } from '../utils/paths.js';
import { ENV } from '../config/env.js';
import fs from 'fs-extra';

export const loadConfig = async (): Promise<ZanatConfig | null> => {
  try {
    const exists = await fs.pathExists(CONFIG_FILE);
    if (!exists) {
      return null;
    }
    const content = await fs.readFile(CONFIG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
};

export const saveConfig = async (config: ZanatConfig): Promise<void> => {
  await fs.ensureDir(CONFIG_FILE.replace('/config.json', ''));
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
};

export const getDefaultConfig = (): ZanatConfig => {
  return {
    hubUrl: ENV.DEFAULT_HUB_URL,
    hubBranch: ENV.DEFAULT_HUB_BRANCH,
  };
};
