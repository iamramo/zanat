import {
  Log,
  AgentSkill,
  Path,
  Config,
  Git,
  Display,
  Fs,
  Chalk,
  HubSkill,
  LockFile,
  Prompt,
} from '@iamramo/zanat-core';
import type { PinOption } from '../schemas/pin.js';

interface AddOptions {
  pin?: PinOption;
}

export const addCommand = async (
  fullSkillName: string | undefined,
  options: AddOptions
): Promise<void> => {
  const pinOption = options.pin;

  // Bulk-add: no skill name provided (pull already done in preAction hook)
  if (fullSkillName === undefined) {
    if (pinOption !== undefined) {
      Log.msg(Chalk.red('--pin cannot be used without a skill name.'), { prefix: '✗' });
      process.exit(1);
    }

    const allHubSkills = await HubSkill.findAll();
    const lockFileSkills = await LockFile.findAll();
    const installedNames = new Set(Object.keys(lockFileSkills));

    const alreadyAdded = allHubSkills.filter((s) => installedNames.has(s.fullName));
    const toAdd = allHubSkills.filter((s) => !installedNames.has(s.fullName));

    if (alreadyAdded.length > 0) {
      Log.msg(Chalk.blue('Already added (skipping):'), { prefix: '•', prefixColor: 'blue' });
      alreadyAdded.forEach((s) => Log.msg(Chalk.gray(s.fullName), { spacing: 2 }));
      Log.blank();
    }

    if (toAdd.length === 0) {
      Log.msg(Chalk.blue('All hub skills are already added.'));
      return;
    }

    const shouldAdd = await Prompt.confirm({
      message: `Add ${toAdd.length} skill(s)?`,
      default: true,
    });

    if (!shouldAdd) {
      Log.msg(Chalk.blue('Cancelled.'));
      return;
    }

    Log.blank();

    const config = await Config.get();
    const resolvedCommit = await Git.resolveCommit(config.hubBranch);

    for (const skill of toAdd) {
      await AgentSkill.add(skill.fullName, config.hubBranch, resolvedCommit);
      Log.msg(Chalk.green(`Added '${skill.fullName}'`), { prefix: '✔' });
    }

    Log.blank();
    Log.msg(Chalk.green(`Added ${toAdd.length} skill(s)`), { prefix: '✔' });
    return;
  }

  // Single-skill add
  const config = await Config.get();

  let requestedRef: string;
  let resolvedCommit: string;

  if (pinOption !== undefined) {
    requestedRef = pinOption;

    try {
      resolvedCommit = await Git.resolveCommit(requestedRef);
      Log.msg(Chalk.blue(`Pinning to '${requestedRef}' (${Display.getShortSha(resolvedCommit)})`));
    } catch (error) {
      Log.msg(Chalk.red(`Invalid ref: '${requestedRef}' does not exist in hub.`), {
        prefix: '✗',
      });
      Log.debug(error);
      process.exit(1);
    }
  } else {
    requestedRef = config.hubBranch;
    resolvedCommit = await Git.resolveCommit(config.hubBranch);
  }

  // Check if skill directory exists in hub
  const skillDir = await Path.getHubSkillPath(fullSkillName);
  const skillExistsInHub = await Fs.exists(skillDir);
  if (!skillExistsInHub) {
    Log.msg(Chalk.red(`Skill '${fullSkillName}' not found in hub.`), { prefix: '✗' });
    if (pinOption !== undefined) {
      Log.msg(Chalk.gray(`Note: skill must exist on the current hub branch to be copied.`));
    } else {
      Log.msg(
        Chalk.gray(
          `If the skill exists at a specific version, use: zanat add ${fullSkillName} --pin=<tag or commit>`
        )
      );
    }
    process.exit(1);
  }

  await AgentSkill.add(fullSkillName, requestedRef, resolvedCommit);
  Log.msg(Chalk.green(`Added '${fullSkillName}'`), { prefix: '✔' });
};
