import { homedir } from 'node:os';
import path from 'node:path';

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
};
