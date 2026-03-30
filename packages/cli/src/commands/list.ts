import { LockFile, Display, Log, Chalk } from '@iamramo/zanat-core';

export const listCommand = async (): Promise<void> => {
  // Step 1: Load and check skills
  const skills = await LockFile.findAll();
  const skillNames = Object.keys(skills);

  if (skillNames.length === 0) {
    Log.msg(Chalk.gray('No skills added.'));
    Log.msg(Chalk.gray(`Run 'zanat search' to find skills or 'zanat add <skill>' to add one.`));
    return;
  }

  // Step 2: Display skills with versions
  Log.msg(Chalk.blue('Added skills:'));
  Log.blank();

  for (const skillName of skillNames) {
    const displayVersion = await Display.getDisplayVersion(skillName);
    Log.msg(Chalk.bold(`${skillName} `) + Chalk.blue(displayVersion), {
      prefix: '•',
      prefixColor: 'white',
      spacing: 2,
    });
  }

  Log.blank();
  Log.msg(Chalk.gray(`Total: ${skillNames.length} skill(s)`));
};
