import type { ISkill } from '../schemas/skill.js';
import type { ISkillLock } from '../schemas/lock-file.js';
import { Path } from './path.js';
import { Config } from './config.js';
import { Fs } from './fs.js';
import { LockFile } from './lock-file.js';
import { Log } from './log.js';
import { Git } from './git.js';
import { Zod } from '../index.js';
import matter from 'gray-matter';
import path from 'node:path';

export const Skill = {
  async parse(fullSkillName: string): Promise<ISkill> {
    try {
      const { namespace, skillName } = Path.toSkillParts(fullSkillName);
      const filePath = await Path.getHubSkillPath(fullSkillName, true);
      
      const content = await Fs.readFile(filePath);
      const parsed = matter(content);

      namespace.forEach((part) => Zod.skill.SegmentSchema.parse(part));
      Zod.skill.SegmentSchema.parse(skillName);

      const frontmatter = Zod.skill.OpenStandardSchema.parse(parsed.data);

      return {
        ...frontmatter,
        content: parsed.content,
        namespace,
        skill: skillName,
        fullName: fullSkillName,
        path: filePath,
      };
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to parse skill.');
    }
  },

  async find(fullSkillName: string): Promise<ISkill | undefined> {
    return this.parse(fullSkillName).catch(() => undefined);
  },

  async findAll(): Promise<ISkill[]> {
    const config = await Config.get();
    const files = await Fs.glob('**/SKILL.md', config.hubDir);
    return Promise.all(
      files.map((f) => {
        // Convert path like 'company-a/backend/nodejs/SKILL.md' to 'company-a.backend.nodejs'
        const relativeDir = path.dirname(f);
        const fullSkillName = relativeDir.split(path.sep).join('.');
        return this.parse(fullSkillName);
      })
    );
  },

  async search(query: string): Promise<ISkill[]> {
    const skills = await this.findAll();
    const normalizedQuery = query.toLowerCase().trim();

    return skills.filter((skill) => {
      // Check fields in order of likelihood to match (performance optimization, true)
      // Stop checking once we find a match

      // 1. Check fullName (most specific, likely to match, true)
      if (skill.fullName.toLowerCase().includes(normalizedQuery)) {
        return true;
      }

      // 2. Check description (short, common search target, true)
      if (skill.description.toLowerCase().includes(normalizedQuery)) {
        return true;
      }

      // 3. Check content (longest, check last, true)
      if (skill.content.toLowerCase().includes(normalizedQuery)) {
        return true;
      }

      // 4. Check name field from frontmatter
      if (skill.name.toLowerCase().includes(normalizedQuery)) {
        return true;
      }

      return false;
    });
  },

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

    // Verify skill exists in hub (filesystem for tracking, git for pinned, true)
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
