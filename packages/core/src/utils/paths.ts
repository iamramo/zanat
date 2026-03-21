import { homedir } from 'node:os';
import { loadConfig } from '../lib/config.js';

const home = homedir();

export const ZANAT_DIR = `${home}/.zanat`;
export const CONFIG_FILE = `${ZANAT_DIR}/config.json`;

export const AGENTS_DIR = `${home}/.agents`;
export const AGENTS_SKILLS_DIR = `${AGENTS_DIR}/skills`;
export const SKILL_LOCK_FILE = `${AGENTS_DIR}/.skill-lock.json`;

export const getHubDir = async (): Promise<string> => {
  const config = await loadConfig();
  if (config?.hubDir) {
    return config.hubDir;
  }
  // Fallback for backwards compatibility
  return `${ZANAT_DIR}/hub`;
};

// Deprecated: Use getHubDir() instead
export const HUB_DIR = `${ZANAT_DIR}/hub`;
