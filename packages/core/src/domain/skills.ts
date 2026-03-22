import type { LockedSkill } from '../types/lock-file.js';
import { Path } from '../path.js';
import { Config } from '../services/config.js';
import { Fs } from '../services/fs.js';
import { LockFile } from '../services/lock-file.js';
import { Git } from '../services/git.js';
import path from 'node:path';

const copySkillWithCheckout = async (
  sourceFile: string,
  targetFile: string,
  commitSha?: string
): Promise<string | undefined> => {
  let resolvedSha: string | undefined;

  if (commitSha) {
    const config = await Config.get();
    resolvedSha = await Git.resolveCommit(config.hubDir, commitSha);
    await Git.checkout(config.hubDir, resolvedSha);
  }

  try {
    await Fs.copy(sourceFile, targetFile);
  } finally {
    if (resolvedSha) {
      const config = await Config.get();
      await Git.checkout(config.hubDir, config.hubBranch);
    }
  }

  return resolvedSha;
};

export const updateSkill = async (
  namespace: string[],
  skillName: string,
  commitSha?: string
): Promise<void> => {
  const fullSkillName = Path.getFullSkillName(namespace, skillName);
  const skillPath = path.join(Path.AGENTS_SKILLS_DIR, fullSkillName);

  const exists = await Fs.exists(skillPath);
  if (!exists) {
    throw new Error(`Skill not added: ${fullSkillName}`);
  }

  const existingSkill = await LockFile.find(fullSkillName);
  if (!existingSkill) {
    throw new Error(`Skill not tracked in lock file: ${fullSkillName}`);
  }

  const config = await Config.get();
  const sourcePath = path.join(config.hubDir, ...namespace, skillName);
  const skillFile = path.join(sourcePath, Path.SKILL_FILENAME);

  const hubExists = await Fs.exists(skillFile);
  if (!hubExists) {
    throw new Error(`Skill not found in hub: ${fullSkillName}`);
  }

  const resolvedSha = await copySkillWithCheckout(
    skillFile,
    path.join(skillPath, Path.SKILL_FILENAME),
    commitSha
  );

  const updatedSkill: LockedSkill = {
    ...existingSkill,
    updatedAt: new Date().toISOString(),
    version: resolvedSha ?? 'latest',
  };

  await LockFile.add(fullSkillName, updatedSkill);
};

export const updateAllSkills = async (): Promise<{
  updated: string[];
  failed: { skill: string; error: string }[];
}> => {
  const skills = await LockFile.findAll();
  const skillNames = Object.keys(skills);

  const updated: string[] = [];
  const failed: { skill: string; error: string }[] = [];

  for (const fullSkillName of skillNames) {
    const skill = skills[fullSkillName];
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
