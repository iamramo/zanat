import type { SkillLock, LockedSkill } from '../types/lock-file.js';
import { Path } from '../paths.js';
import { Fs } from './fs.js';

export const LockFile = {
  async get(): Promise<SkillLock> {
    try {
      const content = await Fs.readFile(Path.SKILL_LOCK_FILE);
      return JSON.parse(content);
    } catch {
      throw new Error('Could not read the lock file.');
    }
  },

  async update(lock: SkillLock): Promise<void> {
    try {
      await Fs.writeFile(Path.SKILL_LOCK_FILE, JSON.stringify(lock, null, 2));
    } catch {
      throw new Error('Could not update the lock file.');
    }
  },

  async add(fullSkillName: string, skill: LockedSkill): Promise<void> {
    const lock = await this.get();
    const updatedLock = {
      ...lock,
      skills: {
        ...lock.skills,
        [fullSkillName]: skill,
      },
    };
    await this.update(updatedLock);
  },

  async remove(fullSkillName: string): Promise<void> {
    const lock = await this.get();
    const { [fullSkillName]: _, ...remainingSkills } = lock.skills;
    const updatedLock = {
      ...lock,
      skills: remainingSkills,
    };
    await this.update(updatedLock);
  },

  async find(fullSkillName: string): Promise<LockedSkill | undefined> {
    const lock = await this.get();
    return lock.skills[fullSkillName];
  },

  async findAll(): Promise<Record<string, LockedSkill>> {
    const lock = await this.get();
    return lock.skills;
  },

  async isPinned(version: string): Promise<boolean> {
    return version !== 'latest';
  },
} as const;
