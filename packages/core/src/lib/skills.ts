import type { Skill, SkillFrontmatter, LockedSkill } from '../types/index.js';
import { HUB_DIR, AGENTS_SKILLS_DIR } from '../utils/paths.js';
import { loadSkillLock, saveSkillLock, addSkillToLock, removeSkillFromLock } from './lockfile.js';
import fs from 'fs-extra';
import matter from 'gray-matter';
import path from 'node:path';

const SKILL_PREFIX = 'zanat.';
const SOURCE_PREFIX = 'zanat/';
const SKILL_FILENAME = 'SKILL.md';
const DEFAULT_SOURCE = 'unknown';

export const installSkill = async (source: string, skillName: string): Promise<void> => {
  const fullSkillName = `${SKILL_PREFIX}${source}.${skillName}`;
  const sourcePath = path.join(HUB_DIR, source, skillName);
  const targetPath = path.join(AGENTS_SKILLS_DIR, fullSkillName);

  const skillFile = path.join(sourcePath, SKILL_FILENAME);
  const exists = await fs.pathExists(skillFile);

  if (!exists) {
    throw new Error(`Skill not found: ${source}/${skillName}`);
  }

  await fs.ensureDir(targetPath);
  await fs.copy(skillFile, path.join(targetPath, SKILL_FILENAME));

  const lock = await loadSkillLock();
  const lockedSkill: LockedSkill = {
    source: `${SOURCE_PREFIX}${source}`,
    skillPath: `${source}/${skillName}/${SKILL_FILENAME}`,
    installedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 'latest',
  };

  const updatedLock = addSkillToLock(lock, fullSkillName, lockedSkill);
  await saveSkillLock(updatedLock);
};

export const removeSkill = async (source: string, skillName: string): Promise<void> => {
  const fullSkillName = `${SKILL_PREFIX}${source}.${skillName}`;
  const skillPath = path.join(AGENTS_SKILLS_DIR, fullSkillName);

  const exists = await fs.pathExists(skillPath);
  if (!exists) {
    throw new Error(`Skill not added: ${source}/${skillName}`);
  }

  await fs.remove(skillPath);

  const lock = await loadSkillLock();
  const updatedLock = removeSkillFromLock(lock, fullSkillName);
  await saveSkillLock(updatedLock);
};

export const getAddedSkills = async (): Promise<string[]> => {
  const lock = await loadSkillLock();
  return Object.keys(lock.skills).filter((name) => name.startsWith(SKILL_PREFIX));
};

export const parseSkill = async (filePath: string): Promise<Skill | null> => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = matter(content);
    const frontmatter = parsed.data as SkillFrontmatter;

    const parts = filePath.split('/');
    const hubIndex = parts.indexOf('hub');
    const source = hubIndex >= 0 ? (parts[hubIndex + 1] ?? DEFAULT_SOURCE) : DEFAULT_SOURCE;

    return {
      ...frontmatter,
      content: parsed.content,
      source,
      path: filePath,
    };
  } catch {
    return null;
  }
};
