import type { ILockFile, ISkillLock } from '../schemas/lock-file.js';
import { Path } from '../path.js';
import { Fs } from './fs.js';
import { Format } from './format.js';

const DEFAULT_LOCK_FILE: ILockFile = {
  version: 1,
  skills: {},
};

export const LockFile = {
  async get(): Promise<ILockFile> {
    try {
      const content = await Fs.readFile(Path.SKILL_LOCK_FILE);
      return JSON.parse(content);
    } catch {
      throw new Error('Could not read the lock file.');
    }
  },

  async ensure(): Promise<void> {
    try {
      await Fs.readFile(Path.SKILL_LOCK_FILE);
    } catch {
      await this.update(DEFAULT_LOCK_FILE);
    }
  },

  async update(lock: ILockFile): Promise<void> {
    try {
      await Fs.writeFile(Path.SKILL_LOCK_FILE, Format.json(lock));
    } catch {
      throw new Error('Could not update the lock file.');
    }
  },

  async add(fullSkillName: string, skill: ISkillLock): Promise<void> {
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

  async find(fullSkillName: string): Promise<ISkillLock | undefined> {
    const lock = await this.get();
    return lock.skills[fullSkillName];
  },

  async findAll(): Promise<Record<string, ISkillLock>> {
    const lock = await this.get();
    return lock.skills;
  },

  isPinned(version: string): boolean {
    return version !== 'latest';
  },
} as const;
