import type { SkillLock, LockedSkill } from '../types/index.js';
import { SKILL_LOCK_FILE } from '../utils/paths.js';
import fs from 'fs-extra';
import path from 'node:path';
import { ENV } from '../config/env.js';

const LOCK_VERSION = 1;

export const loadSkillLock = async (): Promise<SkillLock> => {
  try {
    const exists = await fs.pathExists(SKILL_LOCK_FILE);
    if (!exists) {
      return createEmptyLock();
    }
    const content = await fs.readFile(SKILL_LOCK_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (ENV.DEBUG) {
      console.warn('[zanat] Failed to load skill lock file, starting fresh:', error);
    }
    return createEmptyLock();
  }
};

export const saveSkillLock = async (lock: SkillLock): Promise<void> => {
  await fs.ensureDir(path.dirname(SKILL_LOCK_FILE));
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

export const removeSkillFromLock = (lock: SkillLock, fullSkillName: string): SkillLock => {
  const { [fullSkillName]: _, ...remainingSkills } = lock.skills;
  return {
    ...lock,
    skills: remainingSkills,
  };
};

const createEmptyLock = (): SkillLock => {
  return {
    version: LOCK_VERSION,
    skills: {},
  };
};
