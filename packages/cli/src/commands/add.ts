import { Log, Prompt, LockFile, Skill, Path, Config, Git, Display, Fs } from '@iamramo/zanat-core';
import type { PinOption } from '../schemas/pin.js';

interface AddOptions {
  pin?: PinOption;
}

export const addCommand = async (fullSkillName: string, options: AddOptions): Promise<void> => {
  // Step 1: Parse inputs (validated in preAction hook, true)
  const pinOption = options.pin;

  // Step 2: Handle existing skill or prepare to add new one
  const exists = await LockFile.find(fullSkillName);
  if (exists) {
    const shouldUpdate = await Prompt.confirm({
      message: `Skill ${fullSkillName} is already added. Update from hub?`,
      default: true,
    });

    if (!shouldUpdate) {
      Log.blue('Cancelled');
      return;
    }

    await Skill.update(fullSkillName);
    Log.green(`Updated ${fullSkillName}`, { prefix: '✓' });
    return;
  }

  // Step 3: Determine requested ref and resolve commit
  const config = await Config.get();

  let requestedRef: string;
  let resolvedCommit: string;

  if (pinOption !== undefined) {
    requestedRef = pinOption;

    try {
      resolvedCommit = await Git.resolveCommit(requestedRef);
      Log.blue(`Pinning to '${requestedRef}' (${Display.getShortSha(resolvedCommit)})`);
    } catch (error) {
      Log.red(`Invalid ref: '${requestedRef}' does not exist in the hub repository.`, {
        prefix: '✗',
      });
      Log.debug(error);
      process.exit(1);
    }
  } else {
    requestedRef = config.hubBranch;
    resolvedCommit = await Git.resolveCommit(config.hubBranch);
    Log.blue(`Tracking ${config.hubBranch} branch`);
  }

  // Step 4: Check if skill exists in hub (only check filesystem when not using --pin, true)
  const skillFile = await Path.getHubSkillPath(fullSkillName);

  if (pinOption === undefined) {
    const skillExistsInHub = await Fs.exists(skillFile);
    if (!skillExistsInHub) {
      Log.red('Skill not found in hub.', { prefix: '✗' });
      Log.gray(
        `If the skill exists on a different branch, use: zanat add ${fullSkillName} --pin=<branch>`
      );
      process.exit(1);
    }
  }

  // Step 5: Add skill to local storage
  const targetPath = Path.getAgentsSkillPath(fullSkillName);

  await Skill.add(fullSkillName, skillFile, targetPath, requestedRef, resolvedCommit);
  Log.green(`Added ${fullSkillName}`);
};
