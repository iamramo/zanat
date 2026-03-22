import type { ISkill } from '../schemas/skill.js';
import type { ISkillLock } from '../schemas/lock-file.js';
import { Path } from './path.js';
import { Config } from './config.js';
import { Fs } from './fs.js';
import { LockFile } from './lock-file.js';
import { Zod } from '../index.js';
import matter from 'gray-matter';
import path from 'node:path';

export const Skill = {
  async parse(filePath: string): Promise<ISkill> {
    try {
      const content = await Fs.readFile(filePath);
      const parsed = matter(content);

      const config = await Config.get();
      const relativePath = path.relative(config.hubDir, filePath);
      const pathParts = relativePath.split(path.sep);

      pathParts.pop();

      const skillName = pathParts.pop();
      if (!skillName) {
        throw new Error('Could not extract skill name from path.');
      }
      Zod.skill.SegmentSchema.parse(skillName);

      const namespace = pathParts;
      if (namespace.length === 0) {
        throw new Error('Could not extract namespace from path.');
      }
      namespace.forEach((part) => Zod.skill.SegmentSchema.parse(part));

      const fullName = namespace.join('.') + '.' + skillName;

      const frontmatter = Zod.skill.OpenStandardSchema.parse(parsed.data);

      return {
        ...frontmatter,
        content: parsed.content,
        namespace,
        skill: skillName,
        fullName,
        path: filePath,
      };
    } catch {
      throw new Error('Failed to parse skill.');
    }
  },

  async find(fullName: string): Promise<ISkill | undefined> {
    const config = await Config.get();
    const { namespace, skillName } = Path.toSkillParts(fullName);

    const skillPath = path.join(config.hubDir, ...namespace, skillName, Path.SKILL_FILENAME);
    return this.parse(skillPath).catch(() => undefined);
  },

  async findAll(): Promise<ISkill[]> {
    const config = await Config.get();
    const files = await Fs.glob('**/SKILL.md', config.hubDir);
    return Promise.all(files.map((f) => this.parse(path.join(config.hubDir, f))));
  },

  async search(query: string): Promise<ISkill[]> {
    const skills = await this.findAll();
    return skills.filter((skill) => skill.fullName.toLowerCase().includes(query.toLowerCase()));
  },

  async remove(skillPath: string): Promise<void> {
    await Fs.remove(skillPath);

    const fullSkillName = path.basename(skillPath);
    await LockFile.remove(fullSkillName);
  },

  async add(
    namespace: string[],
    skillName: string,
    sourceFile: string,
    targetDir: string,
    version: string = 'latest'
  ): Promise<void> {
    const fullSkillName = Path.getFullSkillName(namespace, skillName);
    const targetFile = path.join(targetDir, Path.SKILL_FILENAME);

    await Fs.ensureDir(targetDir);
    await Fs.copy(sourceFile, targetFile);

    const existingSkill = await LockFile.find(fullSkillName);

    const lockedSkill: ISkillLock = {
      namespace,
      skillName,
      hubPath: Path.getSkillFilePath(namespace, skillName),
      addedAt: existingSkill?.addedAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version,
    };

    await LockFile.add(fullSkillName, lockedSkill);
  },

  async update(namespace: string[], skillName: string): Promise<void> {
    const fullSkillName = Path.getFullSkillName(namespace, skillName);
    const skillPath = Path.getSkillTargetDir(fullSkillName);

    const exists = await Fs.exists(skillPath);
    if (!exists) {
      throw new Error(`Skill not added: ${fullSkillName}`);
    }

    const existingSkill = await LockFile.find(fullSkillName);
    if (!existingSkill) {
      throw new Error(`Skill not tracked in lock file: ${fullSkillName}`);
    }

    const sourcePath = await Path.getSkillHubDir(namespace, skillName);
    const skillFile = Path.getSkillFile(sourcePath);

    const hubExists = await Fs.exists(skillFile);
    if (!hubExists) {
      throw new Error(`Skill not found in hub: ${fullSkillName}`);
    }

    await this.add(namespace, skillName, skillFile, skillPath, 'latest');
  },

  async updateAll(): Promise<void> {
    const skills = await LockFile.findAll();

    for (const fullSkillName of Object.keys(skills)) {
      const skill = skills[fullSkillName];
      if (!skill) continue;
      await this.update(skill.namespace, skill.skillName);
    }
  },
};
