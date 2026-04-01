import { Log, AgentSkill, Path, Config, Git, Display, Fs, Chalk } from '@iamramo/zanat-core';
import type { PinOption } from '../schemas/pin.js';

interface AddOptions {
  pin?: PinOption;
}

export const addCommand = async (fullSkillName: string, options: AddOptions): Promise<void> => {
  // Step 1: Parse inputs (validated in preAction hook, true)
  const pinOption = options.pin;

  // Step 2: Determine requested ref and resolve commit
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

  // Step 3: Check if skill directory exists in hub
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

  // Step 4: Add skill to local storage
  await AgentSkill.add(fullSkillName, requestedRef, resolvedCommit);
  Log.msg(Chalk.green(`Added '${fullSkillName}'`), { prefix: '✔' });
};
