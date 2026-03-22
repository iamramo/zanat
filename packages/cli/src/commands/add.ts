import { CommitShaSchema, Logger, confirm, LockFile, Skill, Path } from '@iamramo/zanat-core';
import path from 'node:path';
import { validateSkillArg, ensureHubExists } from '../utils/validation.js';

interface AddOptions {
  commit?: string;
}

export const addCommand = async (skillArg: string, options: AddOptions): Promise<void> => {
  Logger.blue(`Adding skill: ${skillArg}...`);

  try {
    await ensureHubExists();
    const { namespace, skillName } = validateSkillArg(skillArg);

    if (options.commit) {
      CommitShaSchema.parse(options.commit);
    }

    const fullSkillName = Path.getFullSkillName(namespace, skillName);
    const exists = !!(await LockFile.find(fullSkillName));
    if (exists) {
      if (options.commit) {
        Logger.red(
          `Skill ${skillArg} is already added. Use \`zanat update\` to change the pinned version.`
        );
        process.exit(1);
      }

      const shouldUpdate = await confirm({
        message: `Skill ${skillArg} is already added. Update from hub?`,
        default: true,
      });

      if (!shouldUpdate) {
        Logger.blue('Cancelled');
        return;
      }

      await Skill.update(namespace, skillName);
      Logger.green(`Updated ${skillArg}`, { prefix: '✓' });
      return;
    }

    const sourcePath = await Path.getSkillHubDir(namespace, skillName);
    const targetPath = Path.getSkillTargetDir(fullSkillName);
    const skillFile = Path.getSkillFile(sourcePath);

    await Skill.add(namespace, skillName, skillFile, targetPath, options.commit);
    Logger.green(
      `Added ${skillArg}${options.commit ? ` (pinned to ${options.commit.slice(0, 7)})` : ''}`
    );
  } catch {
    Logger.red('Failed to add', { prefix: '✗' });
    process.exit(1);
  }
};
