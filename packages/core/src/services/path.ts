import { homedir } from 'node:os';
import path from 'node:path';
import { Config } from './config.js';
import { FULL_SKILL_NAME_REGEX } from '../schemas/common.js';

const home = homedir();

export const Path = {
  ZANAT_DIR: path.join(home, '.zanat'),
  HUB_DIR: path.join(home, '.zanat', 'hub'),
  CONFIG_FILE: path.join(home, '.zanat', 'config.json'),
  AGENTS_DIR: path.join(home, '.agents'),
  AGENTS_SKILLS_DIR: path.join(home, '.agents', 'skills'),
  SKILL_LOCK_FILE: path.join(home, '.agents', '.zanat-lock.json'),
  SKILL_FILENAME: 'SKILL.md',

  async getHubSkillPath(fullSkillName: string, includeFilename = false): Promise<string> {
    const config = await Config.get();
    const { namespace, skillName } = this.toSkillParts(fullSkillName);
    const dir = path.join(config.hubDir, ...namespace, skillName);
    return includeFilename ? path.join(dir, this.SKILL_FILENAME) : dir;
  },

  getAgentsSkillPath(fullSkillName: string, includeFilename = false): string {
    const dir = path.join(this.AGENTS_SKILLS_DIR, fullSkillName);
    return includeFilename ? path.join(dir, this.SKILL_FILENAME) : dir;
  },

  toSkillParts(fullSkillName: string): { namespace: string[]; skillName: string } {
    if (!FULL_SKILL_NAME_REGEX.test(fullSkillName)) {
      throw new Error(`Invalid skill name: '${fullSkillName}'`);
    }
    const parts = fullSkillName.split('.');
    const skillName = parts.pop()!;
    return { namespace: parts, skillName };
  },

  toFullSkillName(namespace: string[], skillName: string): string {
    return [...namespace, skillName].join('.');
  },
};
