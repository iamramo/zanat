import { H_Skill, Log, Display } from '@iamramo/zanat-core';

export const searchCommand = async (query?: string): Promise<void> => {
  // Step 1: Validate and normalize input
  const normalizedQuery = query?.trim();

  // Step 2: Search for skills
  normalizedQuery
    ? Log.blue(`Searching for: "${normalizedQuery}"...`)
    : Log.blue('Available skills:');
  Log.blank();

  const results = normalizedQuery ? await H_Skill.search(normalizedQuery) : await H_Skill.findAll();

  // Step 2: Display results
  if (results.length === 0) {
    Log.gray('No skills found.');
    return;
  } else {
    results.forEach((skill) => {
      Log.white(skill.fullName, { prefix: '•', spacing: 2 });
      const truncatedDesc = Display.truncate(skill.description);
      Log.gray(truncatedDesc, { spacing: 4 });
      Log.blank();
    });
  }

  Log.gray(`Found ${results.length} skill(s)`);
  Log.blank();
  Log.gray('Add a skill with: zanat add <skill>');
};
