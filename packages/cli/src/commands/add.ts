import {
  updateSkill,
  CommitShaSchema,
  Logger,
  confirm,
  LockFile,
  Skills,
  Config,
  Path,
} from '@iamramo/zanat-core';
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

      await updateSkill(namespace, skillName);
      Logger.green(`Updated ${skillArg}`, { prefix: '✓' });
      return;
    }

    const config = await Config.get();
    const sourcePath = path.join(config.hubDir, ...namespace, skillName);
    const targetPath = path.join(Path.AGENTS_SKILLS_DIR, fullSkillName);
    const skillFile = path.join(sourcePath, Path.SKILL_FILENAME);

    await Skills.add(namespace, skillName, skillFile, targetPath, options.commit);
    Logger.green(
      `Added ${skillArg}${options.commit ? ` (pinned to ${options.commit.slice(0, 7)})` : ''}`
    );
  } catch (error) {
    Logger.red('Failed to add', { prefix: '✗' });
    process.exit(1);
  }
};
