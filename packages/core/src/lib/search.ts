import { HUB_DIR } from '../utils/paths.js';
import { parseSkill } from './skills.js';
import fs from 'fs-extra';
import path from 'node:path';

export interface SkillInfo {
  namespace: string[];
  skillName: string;
  fullName: string;
  description: string;
}

export const searchSkills = async (query?: string): Promise<SkillInfo[]> => {
  const allSkills = await findAllSkills();

  return query ? filterByQuery(allSkills, query) : allSkills;
};

const findAllSkills = async (): Promise<SkillInfo[]> => {
  const skills: SkillInfo[] = [];

  const scanDirectory = async (dir: string, namespace: string[] = []): Promise<void> => {
    try {
      const entries = await fs.readdir(dir);

      for (const entry of entries) {
        const entryPath = path.join(dir, entry);
        const stat = await fs.stat(entryPath);

        if (stat.isDirectory()) {
          // Check if this directory contains a SKILL.md
          const skillFile = path.join(entryPath, 'SKILL.md');
          const hasSkillFile = await fs.pathExists(skillFile);

          if (hasSkillFile) {
            // This is a skill directory
            const skill = await parseSkill(skillFile);
            if (skill) {
              skills.push({
                namespace,
                skillName: entry,
                fullName: [...namespace, entry].join('.'),
                description: skill.description || 'No description',
              });
            }
          } else {
            // Continue scanning deeper
            await scanDirectory(entryPath, [...namespace, entry]);
          }
        }
      }
    } catch {
      // Directory doesn't exist or can't be read, skip
    }
  };

  await scanDirectory(HUB_DIR);
  return skills;
};

const filterByQuery = (skills: SkillInfo[], query: string): SkillInfo[] => {
  const normalizedQuery = query.toLowerCase();
  return skills.filter((skill) => matchesQuery(skill, normalizedQuery));
};

const matchesQuery = (skill: SkillInfo, query: string): boolean => {
  const searchableText = [skill.fullName, skill.description].join(' ').toLowerCase();
  return searchableText.includes(query);
};
