import { Skill, Log, Display, Config } from '@iamramo/zanat-core';

export const searchCommand = async (query?: string): Promise<void> => {
  try {
    await Config.validate();

    query ? Log.blue(`Searching for: "${query}"...`) : Log.blue('Available skills:');
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

    Log.gray(`Found ${results.length} skill(s)`);
    Log.blank();
    Log.gray('Add a skill with: zanat add <skill>');
  } catch {
    Log.red('Failed to search', { prefix: '✗' });
    process.exit(1);
  }
};
