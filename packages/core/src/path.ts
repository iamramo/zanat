import { homedir } from 'node:os';
import path from 'node:path';
import { Config } from './services/config.js';
import { Zod } from './services/zod.js';

const home = homedir();

export const Path = {
  ZANAT_DIR: `${home}/.zanat`,
  CONFIG_FILE: `${home}/.zanat/config.json`,
  HUB_DIR: `${home}/.zanat/hub`,
  AGENTS_DIR: `${home}/.agents`,
  AGENTS_SKILLS_DIR: `${home}/.agents/skills`,
  SKILL_LOCK_FILE: `${home}/.agents/.zanat-lock.json`,
  SKILL_FILENAME: 'SKILL.md',

  getFullSkillName(namespace: string[], skillName: string): string {
    return [...namespace, skillName].join('.');
  },

  getSkillFilePath(namespace: string[], skillName: string): string {
    return path.join(...namespace, skillName, this.SKILL_FILENAME);
  },

  async getSkillHubDir(namespace: string[], skillName: string): Promise<string> {
    const config = await Config.get();
    return path.join(config.hubDir, ...namespace, skillName);
  },

  getSkillTargetDir(fullSkillName: string): string {
    return path.join(this.AGENTS_SKILLS_DIR, fullSkillName);
  },

  getSkillFile(skillDir: string): string {
    return path.join(skillDir, this.SKILL_FILENAME);
  },

  toSkillParts(fullSkillName: string): { namespace: string[]; skillName: string } {
    const parts = fullSkillName.split('.');
    const skillName = parts.pop()!;
    
    Zod.SegmentSchema.parse(skillName);
    parts.forEach((part) => Zod.SegmentSchema.parse(part));
    
    return { namespace: parts, skillName };
  },
};
