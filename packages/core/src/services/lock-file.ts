import type { ILockFile, ISkillLock } from '../schemas/lock-file.js';
import { Path } from './path.js';
import { Fs } from './fs.js';
import { Format } from './format.js';
import { Log } from './log.js';
import { Config } from './config.js';
import { Zod } from './zod.js';

const DEFAULT_LOCK_FILE: ILockFile = {
  version: 1,
  skills: {},
};

export const LockFile = {
  async get(): Promise<ILockFile> {
    try {
      const content = await Fs.readFile(Path.SKILL_LOCK_FILE);
      const parsed = JSON.parse(content);
      return Zod.lockFile.FileSchema.parse(parsed);
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to read the lock file.');
    }
  },

  async create(): Promise<void> {
    await this.update(DEFAULT_LOCK_FILE);
  },

  async update(lock: ILockFile): Promise<void> {
    try {
      const validated = Zod.lockFile.FileSchema.parse(lock);
      await Fs.writeFile(Path.SKILL_LOCK_FILE, Format.json(validated));
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to update the lock file.');
    }
  },

  async add(fullSkillName: string, skill: ISkillLock): Promise<void> {
    const validatedSkill = Zod.lockFile.SkillSchema.parse(skill);
    const lock = await this.get();
    const updatedLock = {
      ...lock,
      skills: {
        ...lock.skills,
        [fullSkillName]: validatedSkill,
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

  async isPinned(fullSkillName: string): Promise<boolean> {
    const skill = await this.find(fullSkillName);
    if (!skill) throw new Error(`Skill '${fullSkillName}' not found in lock file.`);
    const { hubBranch } = await Config.get();
    return skill.requestedRef !== hubBranch;
  },

} as const;
