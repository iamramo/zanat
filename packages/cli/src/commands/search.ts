import { Skill, Log, Display } from '@iamramo/zanat-core';
import { ensureHubExists } from '../utils/validation.js';

export const searchCommand = async (query?: string): Promise<void> => {
  try {
    await ensureHubExists();

    if (query) {
      Log.blue(`Searching for: "${query}"...`);
    } else {
      Log.blue('Available skills:');
    }
    Log.blank();

    const results = query ? await Skill.search(query) : await Skill.findAll();

    if (results.length === 0) {
      Log.gray('No skills found.');
      return;
    }

    results.forEach((skill) => {
      Log.green(skill.fullName, { prefix: '•' });
      const truncatedDesc = Display.truncate(skill.description);
      Log.gray(truncatedDesc, { spacing: 2 });
      Log.blank();
    });

    Log.gray(`Found ${results.length} skill${results.length === 1 ? '' : 's'}`);
    Log.blank();
    Log.gray('Add a skill with: zanat add <namespace.skill-name>');
  } catch {
    Log.red('Failed to search', { prefix: '✗' });
    process.exit(1);
  }
};
