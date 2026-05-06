import { LockFile, Display, Log, Chalk, Config } from '@iamramo/zanat-core';

export const listCommand = async (): Promise<void> => {
  // Step 1: Load and check skills
  const skills = await LockFile.findAll();
  const skillNames = Object.keys(skills);

  if (skillNames.length === 0) {
    Log.msg(Chalk.gray('No skills added.'));
    Log.msg(Chalk.gray(`Run 'zanat search' to find skills or 'zanat add <skill>' to add one.`));
    return;
  }

  // Step 2: Check if multiple hubs exist
  const config = await Config.get();
  const multiHub = Object.keys(config.hubs).length > 1;

  // Step 3: Display skills with versions
  Log.msg(Chalk.bold.blue('Added skills:'));
  Log.blank();

  for (const skillName of skillNames) {
    const skill = skills[skillName]!;
    const displayVersion = await Display.getDisplayVersion(skillName);
    const hubPrefix = multiHub ? Chalk.gray(`[${skill.hubAlias}] `) : '';
    Log.msg(hubPrefix + Chalk.bold(`${skillName} `) + Chalk.blue(displayVersion), {
      prefix: '•',
      prefixColor: 'white',
      spacing: 2,
    });
  }

  Log.blank();
  Log.msg(Chalk.gray(`Total: ${skillNames.length} skill(s)`));
};
