import type { ILockFile, ISkillLock, IRefStatus } from '../schemas/lock-file.js';
import { GIT_COMMIT_SHA_REGEX } from '../schemas/common.js';
import { Path } from './path.js';
import { Fs } from './fs.js';
import { Format } from './format.js';
import { Log } from './log.js';
import { Git } from './git.js';
import { Config } from './config.js';
import { Zod } from '../index.js';

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
      throw new Error('Could not read the lock file.');
    }
  },

  async ensure(): Promise<void> {
    try {
      await Fs.readFile(Path.SKILL_LOCK_FILE);
    } catch (error) {
      Log.debug(error);
      await this.update(DEFAULT_LOCK_FILE);
    }
  },

  async update(lock: ILockFile): Promise<void> {
    try {
      const validated = Zod.lockFile.FileSchema.parse(lock);
      await Fs.writeFile(Path.SKILL_LOCK_FILE, Format.json(validated));
    } catch (error) {
      Log.debug(error);
      throw new Error('Could not update the lock file.');
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

  isPinned(skill: ISkillLock, currentHubBranch: string): boolean {
    return skill.requestedRef !== currentHubBranch;
  },

  async getRefStatus(skill: ISkillLock): Promise<IRefStatus> {
    const { requestedRef, resolvedCommit } = skill;

    try {
      await Git.resolveCommit(requestedRef);
      return 'ok';
    } catch (error) {
      Log.debug(error);

      try {
        await Git.raw(['cat-file', '-t', resolvedCommit]);
        return 'orphaned';
      } catch (error) {
        Log.debug(error);
        return 'broken';
      }
    }
  },

  async findUniqueRefs(): Promise<string[]> {
    const config = await Config.get();
    const skills = await this.findAll();
    const refs = new Set<string>([config.hubBranch]);
    const skillList = Object.values(skills);

    for (const skill of skillList) {
      if (!skill) continue;
      // Skip commit SHAs - can't fetch specific commits
      if (GIT_COMMIT_SHA_REGEX.test(skill.requestedRef)) continue;
      refs.add(skill.requestedRef);
    }

    return Array.from(refs);
  },

  async findSkillsByRef(ref: string): Promise<string[]> {
    const skills = await this.findAll();
    const result: string[] = [];
    const skillList = Object.entries(skills);

    for (const [name, skill] of skillList) {
      if (skill?.requestedRef === ref) {
        result.push(name);
      }
    }

    return result;
  },
} as const;
