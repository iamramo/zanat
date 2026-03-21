import type { SkillLock, LockedSkill } from '../types/index.js';
import { SKILL_LOCK_FILE } from '../utils/paths.js';
import fs from 'fs-extra';

const LOCK_VERSION = 1;

export const loadSkillLock = async (): Promise<SkillLock> => {
  try {
    const exists = await fs.pathExists(SKILL_LOCK_FILE);
    if (!exists) {
      return createEmptyLock();
    }
    const content = await fs.readFile(SKILL_LOCK_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return createEmptyLock();
  }
};

export const saveSkillLock = async (lock: SkillLock): Promise<void> => {
  await fs.ensureDir(SKILL_LOCK_FILE.replace('/.skill-lock.json', ''));
  await fs.writeFile(SKILL_LOCK_FILE, JSON.stringify(lock, null, 2));
};

export const addSkillToLock = (
  lock: SkillLock,
  fullSkillName: string,
  skill: LockedSkill
): SkillLock => {
  return {
    ...lock,
    skills: {
      ...lock.skills,
      [fullSkillName]: skill,
    },
  };
};

const createEmptyLock = (): SkillLock => {
  return {
    version: LOCK_VERSION,
    skills: {},
  };
};
