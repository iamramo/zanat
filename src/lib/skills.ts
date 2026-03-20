import { Skill, SkillFrontmatter, LockedSkill } from '../types';
import { HUB_DIR, AGENTS_SKILLS_DIR } from '../utils/paths';
import { loadSkillLock, saveSkillLock, addSkillToLock } from './lockfile';
import fs from 'fs-extra';
import matter from 'gray-matter';
import path from 'path';

export async function installSkill(source: string, skillName: string): Promise<void> {
  const fullSkillName = `zanat.${source}.${skillName}`;
  const sourcePath = path.join(HUB_DIR, 'sources', source, skillName);
  const targetPath = path.join(AGENTS_SKILLS_DIR, fullSkillName);

  // Check if skill exists in hub
  const skillFile = path.join(sourcePath, 'SKILL.md');
  const exists = await fs.pathExists(skillFile);
  
  if (!exists) {
    throw new Error(`Skill not found: ${source}/${skillName}`);
  }

  // Copy skill to agents directory
  await fs.ensureDir(targetPath);
  await fs.copy(skillFile, path.join(targetPath, 'SKILL.md'));

  // Update lockfile
  const lock = await loadSkillLock();
  const lockedSkill: LockedSkill = {
    source: `zanat/${source}`,
    skillPath: `sources/${source}/${skillName}/SKILL.md`,
    installedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 'latest', // MVP: only support latest
  };
  
  const updatedLock = addSkillToLock(lock, fullSkillName, lockedSkill);
  await saveSkillLock(updatedLock);
}

export async function listInstalledSkills(): Promise<string[]> {
  const lock = await loadSkillLock();
  return Object.keys(lock.skills).filter(name => name.startsWith('zanat.'));
}

export async function parseSkill(filePath: string): Promise<Skill | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = matter(content);
    const frontmatter = parsed.data as SkillFrontmatter;
    
    // Extract source from path (sources/{source}/{skill}/SKILL.md)
    const parts = filePath.split('/');
    const sourceIndex = parts.indexOf('sources');
    const source = sourceIndex >= 0 ? parts[sourceIndex + 1] : 'unknown';
    
    return {
      ...frontmatter,
      content: parsed.content,
      source,
      path: filePath,
    };
  } catch {
    return null;
  }
}
