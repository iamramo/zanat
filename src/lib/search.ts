import { HUB_DIR } from '../utils/paths';
import { parseSkill } from './skills';
import fs from 'fs-extra';
import path from 'path';

export async function searchSkills(query?: string): Promise<Array<{ source: string; name: string; description: string }>> {
  const sourcesDir = path.join(HUB_DIR, 'sources');
  const results: Array<{ source: string; name: string; description: string }> = [];

  try {
    const sources = await fs.readdir(sourcesDir);

    for (const source of sources) {
      const sourcePath = path.join(sourcesDir, source);
      const stat = await fs.stat(sourcePath);

      if (!stat.isDirectory()) continue;

      const skills = await fs.readdir(sourcePath);

      for (const skill of skills) {
        const skillPath = path.join(sourcePath, skill, 'SKILL.md');
        const skillFile = await parseSkill(skillPath);

        if (!skillFile) continue;

        // If no query, return all skills
        // If query, filter by name, description, or tags
        if (!query || matchesQuery(skillFile, query.toLowerCase())) {
          results.push({
            source,
            name: skill,
            description: skillFile.description || 'No description',
          });
        }
      }
    }
  } catch {
    // Hub not initialized or empty
  }

  return results;
}

function matchesQuery(skill: { name: string; description: string; tags?: string[] }, query: string): boolean {
  const searchableText = [
    skill.name.toLowerCase(),
    skill.description.toLowerCase(),
    ...(skill.tags || []).map(t => t.toLowerCase()),
  ].join(' ');

  return searchableText.includes(query);
}
