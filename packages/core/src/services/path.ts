import { homedir } from 'node:os';
import path from 'node:path';
import { Config } from './config.js';

const home = homedir();

export const Path = {
  ZANAT_DIR: path.join(home, '.zanat'),
  CONFIG_FILE: path.join(home, '.zanat', 'config.json'),
  AGENTS_DIR: path.join(home, '.agents'),
  AGENTS_SKILLS_DIR: path.join(home, '.agents', 'skills'),
  SKILL_LOCK_FILE: path.join(home, '.agents', '.zanat-lock.json'),
  SKILL_FILENAME: 'SKILL.md',

  async getHubSkillPath(fullSkillName: string, withFile = false): Promise<string> {
    const config = await Config.get();
    const { namespace, skillName } = this.toSkillParts(fullSkillName);
    const dir = path.join(config.hubDir, ...namespace, skillName);
    return withFile ? path.join(dir, this.SKILL_FILENAME) : dir;
  },

  getAgentsSkillPath(fullSkillName: string, withFile = false): string {
    const { namespace, skillName } = this.toSkillParts(fullSkillName);
    const dir = path.join(this.AGENTS_SKILLS_DIR, ...namespace, skillName);
    return withFile ? path.join(dir, this.SKILL_FILENAME) : dir;
  },

  toSkillParts(fullSkillName: string): { namespace: string[]; skillName: string } {
    const parts = fullSkillName.split('.');
    const skillName = parts.pop()!;
    return { namespace: parts, skillName };
  },
};
