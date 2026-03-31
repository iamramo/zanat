import { HubSkill, Log, Display, Chalk } from '@iamramo/zanat-core';

export const searchCommand = async (query?: string): Promise<void> => {
  // Step 1: Validate and normalize input
  const normalizedQuery = query?.trim();

  // Step 2: Search for skills
  if (normalizedQuery) {
    Log.msg(Chalk.blue(`Searching for: "${normalizedQuery}"...`));
  } else {
    Log.msg(Chalk.blue('Available skills:'));
  }
  Log.blank();

  const results = normalizedQuery
    ? await HubSkill.search(normalizedQuery)
    : await HubSkill.findAll();

  // Step 3: Display results
  if (results.length === 0) {
    Log.msg(Chalk.gray('No skills found.'));
    return;
  } else {
    results.forEach((skill) => {
      Log.msg(Chalk.white(skill.fullName), { prefix: '•', prefixColor: 'white', spacing: 2 });
      const truncatedDesc = Display.truncate(skill.description);
      Log.msg(Chalk.gray(truncatedDesc), { spacing: 4 });
      Log.blank();
    });
  }

  Log.msg(Chalk.gray(`Found ${results.length} skill(s)`));
  Log.blank();
  Log.msg(Chalk.gray('Add a skill with: zanat add <skill>'));
};
