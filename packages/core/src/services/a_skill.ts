import type { ISkillLock } from '../schemas/lock-file.js';
import { Path } from './path.js';
import { Config } from './config.js';
import { Fs } from './fs.js';
import { LockFile } from './lock-file.js';
import { Log } from './log.js';
import { Git } from './git.js';
import path from 'node:path';

export const A_Skill = {
  async remove(skillPath: string): Promise<void> {
    await Fs.remove(skillPath);

    const fullSkillName = path.basename(skillPath);
    await LockFile.remove(fullSkillName);
  },

  async add(fullSkillName: string, requestedRef: string, resolvedCommit: string): Promise<void> {
    const targetFile = Path.getAgentsSkillPath(fullSkillName, true);
    const sourceFile = await Path.getHubSkillPath(fullSkillName, true);

    await Fs.ensureDir(Path.getAgentsSkillPath(fullSkillName));

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
    const skillPath = Path.getAgentsSkillPath(fullSkillName);

    const skillExists = await Fs.exists(skillPath);
    if (!skillExists) {
      throw new Error(`Skill not added: ${fullSkillName}`);
    }

    const existingSkill = await LockFile.find(fullSkillName);
    if (!existingSkill) {
      throw new Error(`Skill not tracked in lock file: ${fullSkillName}`);
    }

    const config = await Config.get();
    const requestedRef = existingSkill.requestedRef;
    const hubFilePath = await Path.getHubSkillPath(fullSkillName, true);

    // Verify skill exists in hub (filesystem for tracking, git for pinned)
    if (requestedRef === config.hubBranch) {
      const hubExists = await Fs.exists(hubFilePath);
      if (!hubExists) {
        throw new Error(`Skill not found in hub filesystem: ${fullSkillName}`);
      }
    } else {
      try {
        await Git.show(requestedRef, hubFilePath);
      } catch (error) {
        Log.debug(error);
        throw new Error(`Skill not found at ref '${requestedRef}': ${fullSkillName}`);
      }
    }

    let resolvedCommit: string;

    const refStatus = await LockFile.getRefStatus(existingSkill);

    if (refStatus === 'orphaned') {
      resolvedCommit = existingSkill.resolvedCommit;
    } else {
      try {
        resolvedCommit = await Git.resolveCommit(requestedRef);
      } catch (error) {
        Log.debug(error);
        resolvedCommit = existingSkill.resolvedCommit;
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
