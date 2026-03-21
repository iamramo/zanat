import { HUB_DIR } from '../utils/paths.js';
import { parseSkill } from './skills.js';
import fs from 'fs-extra';
import path from 'node:path';

export interface SkillInfo {
  source: string;
  name: string;
  description: string;
}

export const searchSkills = async (query?: string): Promise<SkillInfo[]> => {
  const sources = await getSources();
  const allSkills = await Promise.all(sources.map(getSkillsForSource));
  const flattened = allSkills.flat();

  return query ? filterByQuery(flattened, query) : flattened;
};

const getSources = async (): Promise<string[]> => {
  const sourcesDir = path.join(HUB_DIR, 'sources');

  try {
    const entries = await fs.readdir(sourcesDir);
    const stats = await Promise.all(
      entries.map(async (entry) => ({
        name: entry,
        isDirectory: (await fs.stat(path.join(sourcesDir, entry))).isDirectory(),
      }))
    );
    return stats.filter((s) => s.isDirectory).map((s) => s.name);
  } catch {
    return [];
  }
};

const getSkillsForSource = async (source: string): Promise<SkillInfo[]> => {
  const sourcePath = path.join(HUB_DIR, 'sources', source);

  try {
    const skills = await fs.readdir(sourcePath);
    const skillInfos = await Promise.all(skills.map((skill) => readSkill(source, skill)));
    return skillInfos.filter((s): s is SkillInfo => s !== null);
  } catch {
    return [];
  }
};

const readSkill = async (source: string, name: string): Promise<SkillInfo | null> => {
  const skillPath = path.join(HUB_DIR, 'sources', source, name, 'SKILL.md');
  const skill = await parseSkill(skillPath);

  if (!skill) {
    return null;
  }

  return {
    source,
    name,
    description: skill.description || 'No description',
  };
};

const filterByQuery = (skills: SkillInfo[], query: string): SkillInfo[] => {
  const normalizedQuery = query.toLowerCase();
  return skills.filter((skill) => matchesQuery(skill, normalizedQuery));
};

const matchesQuery = (skill: SkillInfo, query: string): boolean => {
  const searchableText = [skill.source, skill.name, skill.description].join(' ').toLowerCase();
  return searchableText.includes(query);
};
