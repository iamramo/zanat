import { ZanatConfig } from '../types';
import { CONFIG_FILE } from '../utils/paths';
import { ENV } from '../config/env';
import fs from 'fs-extra';

export async function loadConfig(): Promise<ZanatConfig | null> {
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
}

export async function saveConfig(config: ZanatConfig): Promise<void> {
  await fs.ensureDir(CONFIG_FILE.replace('/config.json', ''));
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getDefaultConfig(): ZanatConfig {
  return {
    hubUrl: ENV.DEFAULT_HUB_URL,
    hubBranch: ENV.DEFAULT_HUB_BRANCH,
  };
}
