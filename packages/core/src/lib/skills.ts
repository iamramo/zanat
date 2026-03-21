import type { Skill, SkillFrontmatter, LockedSkill } from '../types/index.js';
import { HUB_DIR, AGENTS_SKILLS_DIR } from '../utils/paths.js';
import { loadSkillLock, saveSkillLock, addSkillToLock, removeSkillFromLock } from './lockfile.js';
import fs from 'fs-extra';
import matter from 'gray-matter';
import path from 'node:path';

const SKILL_FILENAME = 'SKILL.md';
const DEFAULT_NAMESPACE = ['unknown'];

export const addSkill = async (namespace: string[], skillName: string): Promise<void> => {
  const fullSkillName = [...namespace, skillName].join('.');
  const sourcePath = path.join(HUB_DIR, ...namespace, skillName);
  const targetPath = path.join(AGENTS_SKILLS_DIR, fullSkillName);

  const skillFile = path.join(sourcePath, SKILL_FILENAME);
  const exists = await fs.pathExists(skillFile);

  if (!exists) {
    throw new Error(`Skill not found: ${fullSkillName}`);
  }

  await fs.ensureDir(targetPath);
  await fs.copy(skillFile, path.join(targetPath, SKILL_FILENAME));

  const lock = await loadSkillLock();
  const lockedSkill: LockedSkill = {
    namespace,
    skillName,
    hubPath: path.join(...namespace, skillName, SKILL_FILENAME),
    addedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 'latest',
  };

  const updatedLock = addSkillToLock(lock, fullSkillName, lockedSkill);
  await saveSkillLock(updatedLock);
};

export const removeSkill = async (namespace: string[], skillName: string): Promise<void> => {
  const fullSkillName = [...namespace, skillName].join('.');
  const skillPath = path.join(AGENTS_SKILLS_DIR, fullSkillName);

  const exists = await fs.pathExists(skillPath);
  if (!exists) {
    throw new Error(`Skill not added: ${fullSkillName}`);
  }

  await fs.remove(skillPath);

  const lock = await loadSkillLock();
  const updatedLock = removeSkillFromLock(lock, fullSkillName);
  await saveSkillLock(updatedLock);
};

export const getAddedSkills = async (): Promise<string[]> => {
  const lock = await loadSkillLock();
  return Object.keys(lock.skills);
};

export const parseSkill = async (filePath: string): Promise<Skill | null> => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = matter(content);
    const frontmatter = parsed.data as SkillFrontmatter;

    // Extract namespace and skillName from path
    // Path format: /.../hub/namespace/segment/skillName/SKILL.md
    const relativePath = path.relative(HUB_DIR, filePath);
    const pathParts = relativePath.split(path.sep);

    // Remove the SKILL.md filename
    pathParts.pop();

    // Last part is skill name, rest is namespace
    const skillName = pathParts.pop() || 'unknown';
    const namespace = pathParts.length > 0 ? pathParts : DEFAULT_NAMESPACE;

    return {
      ...frontmatter,
      content: parsed.content,
      namespace,
      skillName,
      path: filePath,
    };
  } catch {
    return null;
  }
};
