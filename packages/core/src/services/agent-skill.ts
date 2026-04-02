import type { ISkillLock } from '../schemas/lock-file.js';
import { Path } from './path.js';
import { Fs } from './fs.js';
import { LockFile } from './lock-file.js';
import { Git } from './git.js';

export const AgentSkill = {
  async remove(fullSkillName: string): Promise<void> {
    const targetDir = Path.getAgentsSkillPath(fullSkillName);
    await Fs.remove(targetDir);
    await LockFile.remove(fullSkillName);
  },

  async add(fullSkillName: string, requestedRef: string, resolvedCommit: string): Promise<void> {
    const sourceDir = await Path.getHubSkillPath(fullSkillName);
    const targetDir = Path.getAgentsSkillPath(fullSkillName);

    // Clean copy: remove stale files then copy entire skill directory
    await Fs.remove(targetDir);
    await Fs.copy(sourceDir, targetDir);

    const existingSkill = await LockFile.find(fullSkillName);
    const { namespace, skillName } = Path.toSkillParts(fullSkillName);

    const lockedSkill: ISkillLock = {
      namespace,
      skillName,
      hubAlias: 'default',
      addedAt: existingSkill?.addedAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requestedRef,
      resolvedCommit,
    };

    await LockFile.add(fullSkillName, lockedSkill);
  },

  async update(fullSkillName: string): Promise<void> {
    const existingSkill = await LockFile.find(fullSkillName);
    if (!existingSkill) throw new Error(`Skill '${fullSkillName}' not found in lock file.`);
    const requestedRef = existingSkill.requestedRef;
    const resolvedCommit = await Git.resolveCommit(requestedRef);
    await this.add(fullSkillName, requestedRef, resolvedCommit);
  },
};
