import { LockFile, Display, Log, Config } from '@iamramo/zanat-core';

export const listCommand = async (): Promise<void> => {
  try {
    // Step 1: Load and check skills
    await Config.validate();
    const skills = await LockFile.findAll();
    const skillNames = Object.keys(skills);

    if (skillNames.length === 0) {
      Log.gray('No skills added.');
      Log.gray('Run `zanat search` to find skills or `zanat add <skill>` to add one.');
      return;
    }

    // Step 2: Display skills with versions
    Log.blue('Added skills:');
    Log.blank();

    for (const skillName of skillNames) {
      const displayVersion = await Display.getDisplayVersion(skillName);
      Log.status(`${skillName}`, displayVersion, 'blue', {
        prefix: '•',
      });
    }

    Log.blank();
    Log.gray(`Total: ${skillNames.length} skill(s)`);
  } catch (error) {
    Log.red('Failed to list skills', { prefix: '✗' });
    Log.debug(error);
    process.exit(1);
  }
};
