import { Log, Prompt, LockFile, A_Skill } from '@iamramo/zanat-core';

export const updateCommand = async (fullSkillName: string | undefined): Promise<void> => {
  // Step 1: Update one skill
  if (fullSkillName) {
    const skill = await LockFile.find(fullSkillName);

    if (!skill) {
      Log.red(`Error: ${fullSkillName} was not found`, { prefix: '✗' });
      process.exit(1);
    }

    const refStatus = await LockFile.getRefStatus(skill);

    if (refStatus === 'orphaned') {
      Log.yellow(
        `Warning: ${fullSkillName} is orphaned - Branch '${skill.requestedRef}' no longer exists, but commit is preserved`,
        {
          prefix: '⚠',
        }
      );
      const shouldContinue = await Prompt.confirm({
        message: 'Update anyway? (will preserve current commit)',
        default: true,
      });
      if (!shouldContinue) {
        Log.blue('Update cancelled');
        return;
      }
    } else if (refStatus === 'broken') {
      Log.red(`Error: ${fullSkillName} is broken - Neither ref nor commit exist`, {
        prefix: '✗',
      });
      process.exit(1);
    }

    await A_Skill.update(fullSkillName);
    Log.green(`Updated ${fullSkillName}`, { prefix: '✓' });
    return;
  }

  // Step 2: Update all skills
  const skills = await LockFile.findAll();
  const skillEntries = Object.entries(skills);

  if (skillEntries.length === 0) {
    Log.blue('No skills to update');
    return;
  }

  const orphanedSkills: string[] = [];
  const brokenSkills: string[] = [];
  const updatableSkills: { name: string; namespace: string[]; skillName: string }[] = [];

  for (const [name, skill] of skillEntries) {
    if (!skill) continue;
    const status = await LockFile.getRefStatus(skill);

    if (status === 'orphaned') {
      orphanedSkills.push(`${name} (orphaned from ${skill.requestedRef})`);
    } else if (status === 'broken') {
      brokenSkills.push(`${name} (broken)`);
    } else {
      updatableSkills.push({ name, namespace: skill.namespace, skillName: skill.skillName });
    }
  }

  // Step 3: Show summary of skill statuses
  if (orphanedSkills.length > 0) {
    Log.blank();
    Log.yellow(`Orphaned skills (will preserve current commits):`, { prefix: '⚠' });
    orphanedSkills.forEach((s) => Log.yellow(s, { spacing: 2 }));
  }

  if (brokenSkills.length > 0) {
    Log.blank();
    Log.red(`Broken skills (cannot update):`, { prefix: '✗' });
    brokenSkills.forEach((s) => Log.red(s, { spacing: 2 }));
  }

  if (updatableSkills.length === 0) {
    Log.blank();
    Log.blue('No updatable skills.');
    return;
  }

  // Step 4: Prompt user and update all updatable skills
  const shouldUpdate = await Prompt.confirm({
    message: `Update ${updatableSkills.length} skill(s)?`,
    default: true,
  });

  if (!shouldUpdate) {
    Log.blue('Update cancelled');
    return;
  }

  Log.blank();
  Log.blue(`Updating ${updatableSkills.length} skill(s)...`);

  for (const { name } of updatableSkills) {
    await A_Skill.update(name);
  }

  Log.green('Updated all skills', { prefix: '✓' });
};
