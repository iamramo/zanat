import { homedir } from 'node:os';
import path from 'node:path';
import { Config } from './config.js';
import { Zod } from './zod.js';

const home = homedir();

export const Path = {
  ZANAT_DIR: path.join(home, '.zanat'),
  CONFIG_FILE: path.join(home, '.zanat', 'config.json'),
  HUB_DIR: path.join(home, '.zanat', 'hub'),
  AGENTS_DIR: path.join(home, '.agents'),
  AGENTS_SKILLS_DIR: path.join(home, '.agents', 'skills'),
  SKILL_LOCK_FILE: path.join(home, '.agents', '.zanat-lock.json'),
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

    Zod.skill.SegmentSchema.parse(skillName);
    parts.forEach((part) => Zod.skill.SegmentSchema.parse(part));

    return { namespace: parts, skillName };
  },
};
