import { ZanatConfig } from '../types';
import { CONFIG_FILE, DEFAULT_HUB_URL, DEFAULT_HUB_BRANCH } from '../utils/paths';
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
    hubUrl: DEFAULT_HUB_URL,
    hubBranch: DEFAULT_HUB_BRANCH,
  };
}
