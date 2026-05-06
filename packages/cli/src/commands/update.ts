import { Log, Prompt, LockFile, AgentSkill, Chalk, Config } from '@iamramo/zanat-core';

export const updateCommand = async (fullSkillName?: string): Promise<void> => {
  // Step 1: Update one skill
  if (fullSkillName) {
    if (await LockFile.isPinned(fullSkillName)) {
      Log.msg(Chalk.yellow(`'${fullSkillName}' is pinned and will not be updated`), {
        prefix: '⚠',
      });
      return;
    }

    await AgentSkill.update(fullSkillName);
    Log.msg(Chalk.green(`Updated '${fullSkillName}'`), { prefix: '✔' });
    return;
  }

  // Step 2: Update all skills
  const { activeHub } = await Config.get();
  const allSkills = await LockFile.findAll();
  const skillEntries = Object.entries(allSkills).filter(([, skill]) => skill.hubAlias === activeHub);

  const pinnedSkills: string[] = [];
  const updatableSkills: string[] = [];

  for (const [name, skill] of skillEntries) {
    if (!skill) continue;
    if (await LockFile.isPinned(name)) {
      pinnedSkills.push(name);
    } else {
      updatableSkills.push(name);
    }
  }

  if (pinnedSkills.length > 0) {
    Log.blank();
    Log.msg(Chalk.blue('Pinned skills (skipping):'), { prefix: '•', prefixColor: 'blue' });
    pinnedSkills.forEach((s) => Log.msg(Chalk.gray(s), { spacing: 2 }));
  }

  if (updatableSkills.length === 0) {
    Log.blank();
    Log.msg(Chalk.blue('No updatable skills.'));
    return;
  }

  const shouldUpdate = await Prompt.confirm({
    message: `Update ${updatableSkills.length} skill(s)?`,
    default: true,
  });

  if (!shouldUpdate) {
    Log.msg(Chalk.blue('Update cancelled'));
    return;
  }

  Log.blank();

  for (const name of updatableSkills) {
    await AgentSkill.update(name);
    Log.msg(Chalk.green(`Updated '${name}'`), { prefix: '✔' });
  }

  Log.blank();
  Log.msg(Chalk.green(`Updated ${updatableSkills.length} skill(s)`), { prefix: '✔' });
};
