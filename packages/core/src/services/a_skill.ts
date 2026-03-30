import type { ISkillLock } from '../schemas/lock-file.js';
import { Path } from './path.js';
import { Config } from './config.js';
import { Fs } from './fs.js';
import { LockFile } from './lock-file.js';
import { Log } from './log.js';
import { Git } from './git.js';
import path from 'node:path';

export const A_Skill = {
  async remove(fullSkillName: string): Promise<void> {
    const targetDir = path.join(Path.AGENTS_SKILLS_DIR, fullSkillName);
    await Fs.remove(targetDir);
    await LockFile.remove(fullSkillName);
  },

  async add(fullSkillName: string, requestedRef: string, resolvedCommit: string): Promise<void> {
    const targetFile = path.join(Path.AGENTS_SKILLS_DIR, fullSkillName, Path.SKILL_FILENAME);
    const sourceFile = await Path.getHubSkillPath(fullSkillName, true);

    await Fs.ensureDir(targetFile.replace('/SKILL.md', ''));

    const config = await Config.get();
    if (requestedRef !== config.hubBranch) {
      // Pinned ref: fetch content from git
      const skillContent = await Git.show(requestedRef, sourceFile);
      await Fs.writeFile(targetFile, skillContent);
    } else {
      // Tracking hub branch: copy from filesystem
      await Fs.copy(sourceFile, targetFile);
    }

    const existingSkill = await LockFile.find(fullSkillName);
    const { namespace, skillName } = Path.toSkillParts(fullSkillName);

    const lockedSkill: ISkillLock = {
      namespace,
      skillName,
      addedAt: existingSkill?.addedAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requestedRef,
      resolvedCommit,
    };

    await LockFile.add(fullSkillName, lockedSkill);
  },

  async update(fullSkillName: string): Promise<void> {
    const existingSkill = await LockFile.find(fullSkillName);
    const requestedRef = existingSkill!.requestedRef;

    let resolvedCommit: string;

    const refStatus = await LockFile.getRefStatus(existingSkill!);

    if (refStatus === 'orphaned') {
      resolvedCommit = existingSkill!.resolvedCommit;
    } else {
      try {
        resolvedCommit = await Git.resolveCommit(requestedRef);
      } catch (error) {
        Log.debug(error);
        resolvedCommit = existingSkill!.resolvedCommit;
      }
    }

    await this.add(fullSkillName, requestedRef, resolvedCommit);
  },

  async updateAll(): Promise<void> {
    const skills = await LockFile.findAll();

    for (const fullSkillName of Object.keys(skills)) {
      const skill = skills[fullSkillName];
      if (!skill) continue;
      await this.update(fullSkillName);
    }
  },
};
