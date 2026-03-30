import type { ISkill } from '../schemas/skill.js';
import { Path } from './path.js';
import { Config } from './config.js';
import { Fs } from './fs.js';
import { Log } from './log.js';
import { Zod } from './zod.js';
import matter from 'gray-matter';
import path from 'node:path';

export const HubSkill = {
  async parse(fullSkillName: string): Promise<ISkill> {
    try {
      const { namespace, skillName } = Path.toSkillParts(fullSkillName);
      const filePath = await Path.getHubSkillPath(fullSkillName, true);

      const content = await Fs.readFile(filePath);
      const parsed = matter(content);

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
    const results = await Promise.allSettled(
      files.map((f) => {
        // Convert path like 'company-a/backend/nodejs/SKILL.md' to 'company-a.backend.nodejs'
        const relativeDir = path.dirname(f);
        const fullSkillName = relativeDir.split(path.sep).join('.');
        return this.parse(fullSkillName);
      })
    );

    return results.reduce<ISkill[]>((skills, result, index) => {
      if (result.status === 'fulfilled') {
        skills.push(result.value);
      } else {
        Log.debug(`Failed to parse skill from ${files[index]}: ${result.reason}`);
      }
      return skills;
    }, []);
  },

  async search(query: string): Promise<ISkill[]> {
    const skills = await this.findAll();
    const normalizedQuery = query.toLowerCase().trim();

    return skills.filter((skill) => {
      // Check fields in order of likelihood to match (performance optimization)
      // Stop checking once we find a match

      // 1. Check fullName (most specific, likely to match)
      if (skill.fullName.toLowerCase().includes(normalizedQuery)) {
        return true;
      }

      // 2. Check description (short, common search target)
      if (skill.description.toLowerCase().includes(normalizedQuery)) {
        return true;
      }

      // 3. Check content (longest, check last)
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
};
