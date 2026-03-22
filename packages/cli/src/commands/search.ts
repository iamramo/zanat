import { Skill, Logger } from '@iamramo/zanat-core';
import { ensureHubExists } from '../utils/validation.js';

const ELLIPSIS = '...';

const truncateDescription = (description: string, maxLength = 256): string => {
  if (description.length <= maxLength) return description;

  const lastSpace = description.lastIndexOf(' ', maxLength - ELLIPSIS.length);
  if (lastSpace === -1) {
    return description.slice(0, maxLength - ELLIPSIS.length) + ELLIPSIS;
  }
  return description.slice(0, lastSpace) + ELLIPSIS;
};

export const searchCommand = async (query?: string): Promise<void> => {
  try {
    await ensureHubExists();

    if (query) {
      Logger.blue(`Searching for: "${query}"...`);
    } else {
      Logger.blue('Available skills:');
    }
    Logger.blank();

    const results = query ? await Skill.search(query) : await Skill.findAll();

    if (results.length === 0) {
      Logger.gray('No skills found.');
      return;
    }

    results.forEach((skill) => {
      Logger.green(skill.fullName, { prefix: '•' });
      const truncatedDesc = truncateDescription(skill.description);
      Logger.gray(truncatedDesc, { spacing: 2 });
      Logger.blank();
    });

    Logger.gray(`Found ${results.length} skill${results.length === 1 ? '' : 's'}`);
    Logger.blank();
    Logger.gray('Add a skill with: zanat add <namespace.skill-name>');
  } catch {
    Logger.red('Failed to search', { prefix: '✗' });
    process.exit(1);
  }
};
