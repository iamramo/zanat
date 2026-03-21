import type { Skill, SkillFrontmatter, LockedSkill } from '../types/index.js';
import { getHubDir, AGENTS_SKILLS_DIR } from '../utils/paths.js';
import { loadSkillLock, saveSkillLock, addSkillToLock, removeSkillFromLock } from './lockfile.js';
import { resolveCommit, checkoutCommit, checkoutMain } from './git.js';
import fs from 'fs-extra';
import matter from 'gray-matter';
import path from 'node:path';

const SKILL_FILENAME = 'SKILL.md';
const DEFAULT_NAMESPACE = ['unknown'];

export const skillExists = async (namespace: string[], skillName: string): Promise<boolean> => {
  const fullSkillName = [...namespace, skillName].join('.');
  const lock = await loadSkillLock();
  return fullSkillName in lock.skills;
};

export const getSkillFromLock = async (namespace: string[], skillName: string): Promise<LockedSkill | null> => {
  const fullSkillName = [...namespace, skillName].join('.');
  const lock = await loadSkillLock();
  return lock.skills[fullSkillName] ?? null;
};

export const addSkill = async (namespace: string[], skillName: string, commitSha?: string): Promise<void> => {
  const fullSkillName = [...namespace, skillName].join('.');
  const hubDir = await getHubDir();
  const sourcePath = path.join(hubDir, ...namespace, skillName);
  const targetPath = path.join(AGENTS_SKILLS_DIR, fullSkillName);

  const skillFile = path.join(sourcePath, SKILL_FILENAME);
  const exists = await fs.pathExists(skillFile);

  if (!exists) {
    throw new Error(`Skill not found: ${fullSkillName}`);
  }

  await fs.ensureDir(targetPath);
  const resolvedSha = await copySkillWithCheckout(skillFile, path.join(targetPath, SKILL_FILENAME), commitSha);

  const lock = await loadSkillLock();
  const existingSkill = lock.skills[fullSkillName];

  const lockedSkill: LockedSkill = {
    namespace,
    skillName,
    hubPath: path.join(...namespace, skillName, SKILL_FILENAME),
    addedAt: existingSkill?.addedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: resolvedSha ?? 'latest',
  };

  const updatedLock = addSkillToLock(lock, fullSkillName, lockedSkill);
  await saveSkillLock(updatedLock);
};

export const isSkillPinned = (skill: LockedSkill): boolean => {
  return skill.version !== 'latest';
};

const copySkillWithCheckout = async (
  sourceFile: string,
  targetFile: string,
  commitSha?: string
): Promise<string | undefined> => {
  let resolvedSha: string | undefined;

  if (commitSha) {
    resolvedSha = await resolveCommit(commitSha);
    await checkoutCommit(resolvedSha);
  }

  try {
    await fs.copy(sourceFile, targetFile);
  } finally {
    if (resolvedSha) {
      await checkoutMain();
    }
  }

  return resolvedSha;
};

export const updateSkill = async (namespace: string[], skillName: string, commitSha?: string): Promise<void> => {
  const fullSkillName = [...namespace, skillName].join('.');
  const skillPath = path.join(AGENTS_SKILLS_DIR, fullSkillName);

  const exists = await fs.pathExists(skillPath);
  if (!exists) {
    throw new Error(`Skill not added: ${fullSkillName}`);
  }

  const lock = await loadSkillLock();
  const existingSkill = lock.skills[fullSkillName];
  if (!existingSkill) {
    throw new Error(`Skill not tracked in lock file: ${fullSkillName}`);
  }

  const hubDir = await getHubDir();
  const sourcePath = path.join(hubDir, ...namespace, skillName);
  const skillFile = path.join(sourcePath, SKILL_FILENAME);

  const hubExists = await fs.pathExists(skillFile);
  if (!hubExists) {
    throw new Error(`Skill not found in hub: ${fullSkillName}`);
  }

  const resolvedSha = await copySkillWithCheckout(skillFile, path.join(skillPath, SKILL_FILENAME), commitSha);

  const updatedSkill: LockedSkill = {
    ...existingSkill,
    updatedAt: new Date().toISOString(),
    version: resolvedSha ?? 'latest',
  };

  const updatedLock = addSkillToLock(lock, fullSkillName, updatedSkill);
  await saveSkillLock(updatedLock);
};

export const updateAllSkills = async (): Promise<{ updated: string[]; failed: { skill: string; error: string }[] }> => {
  const lock = await loadSkillLock();
  const skillNames = Object.keys(lock.skills);

  const updated: string[] = [];
  const failed: { skill: string; error: string }[] = [];

  for (const fullSkillName of skillNames) {
    const skill = lock.skills[fullSkillName];
    if (!skill) continue;

    try {
      await updateSkill(skill.namespace, skill.skillName);
      updated.push(fullSkillName);
    } catch (error) {
      failed.push({
        skill: fullSkillName,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { updated, failed };
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

    const hubDir = await getHubDir();
    const relativePath = path.relative(hubDir, filePath);
    const pathParts = relativePath.split(path.sep);

    pathParts.pop();

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
