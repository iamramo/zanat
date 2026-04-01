import { AgentSkill, LockFile, Log, Chalk, Prompt, Display } from '@iamramo/zanat-core';

export const rmCommand = async (fullSkillName: string | undefined): Promise<void> => {
  // Bulk-remove: no skill name provided
  if (fullSkillName === undefined) {
    const lockFileSkills = await LockFile.findAll();
    const skillNames = Object.keys(lockFileSkills);

    Log.msg(Chalk.bold.blue('Added skills:'));
    Log.blank();

    for (const s of skillNames) {
      const displayVersion = await Display.getDisplayVersion(s);
      Log.msg(Chalk.bold.white(s) + ' ' + Chalk.blue(displayVersion), {
        prefix: '•',
        prefixColor: 'white',
        spacing: 2,
      });
    }
    Log.blank();

    const shouldRemove = await Prompt.confirm({
      message: `Remove all ${skillNames.length} skill(s)? This cannot be undone.`,
      default: false,
    });

    if (!shouldRemove) {
      Log.msg(Chalk.blue('Cancelled.'));
      return;
    }

    Log.blank();

    for (const name of skillNames) {
      await AgentSkill.remove(name);
      Log.msg(Chalk.green(`Removed '${name}'`), { prefix: '✔' });
    }

    Log.blank();
    Log.msg(Chalk.green(`Removed ${skillNames.length} skill(s)`), { prefix: '✔' });
    return;
  }

  // Single-skill remove
  await AgentSkill.remove(fullSkillName);
  Log.msg(Chalk.green(`Removed '${fullSkillName}'`), { prefix: '✔' });
};
