import {
  updateSkill,
  updateAllSkills,
  Config,
  CommitShaSchema,
  Logger,
  confirm,
  LockFile,
  Display,
  Path,
} from '@iamramo/zanat-core';
import { validateSkillArg, ensureHubExists } from '../utils/validation.js';

interface UpdateOptions {
  yes?: boolean;
  commit?: string;
}

export const updateCommand = async (
  skillArg: string | undefined,
  options: UpdateOptions
): Promise<void> => {
  try {
    await ensureHubExists();

    // Validate commit SHA format if provided
    if (options.commit) {
      const result = CommitShaSchema.safeParse(options.commit);
      if (!result.success) {
        Logger.red('Invalid commit SHA format. Must be 7-40 hexadecimal characters.', {
          prefix: '✗',
        });
        process.exit(1);
      }
    }

    // Cannot use --commit when updating all skills
    if (options.commit && !skillArg) {
      Logger.red('Cannot use --commit when updating all skills. Please specify a specific skill.', {
        prefix: '✗',
      });
      process.exit(1);
    }

    if (skillArg) {
      // Update specific skill
      const { namespace, skillName } = validateSkillArg(skillArg);
      const fullSkillName = Path.getFullSkillName(namespace, skillName);

      // Check if skill is pinned and warn if updating without --commit
      if (!options.commit) {
        const skillLock = await LockFile.find(fullSkillName);
        if (skillLock) {
          const config = await Config.get();
          const branchName = config.hubBranch;
          const isPinned = await LockFile.isPinned(skillLock.version);
          if (isPinned) {
            const shortSha = Display.getShortSha(skillLock.version);
            const shouldContinue = await confirm({
              message: `Skill ${skillArg} is pinned to ${shortSha}. This will update to ${branchName} and unpin. Continue?`,
              default: true,
            });

            if (!shouldContinue) {
              Logger.blue('Update cancelled');
              return;
            }
          }
        }
      }

      Logger.blue(`Updating skill: ${skillArg}...`);
      await updateSkill(namespace, skillName, options.commit);

      if (options.commit) {
        Logger.green(`Updated ${skillArg} and pinned to ${options.commit.slice(0, 7)}`, {
          prefix: '✓',
        });
      } else {
        Logger.green(`Updated ${skillArg}`, { prefix: '✓' });
      }
    } else {
      // Update all skills
      const skills = await LockFile.findAll();
      const addedSkills = Object.keys(skills);

      if (addedSkills.length === 0) {
        Logger.blue('No skills to update');
        return;
      }

      if (!options.yes) {
        const shouldUpdate = await confirm({
          message: `This will update ${addedSkills.length} skill(s). Continue?`,
          default: true,
        });

        if (!shouldUpdate) {
          Logger.blue('Update cancelled');
          return;
        }
      }

      Logger.blue(`Updating ${addedSkills.length} skill(s)...`);
      const { updated, failed } = await updateAllSkills();

      if (updated.length > 0) {
        Logger.green(`Updated ${updated.length} skill(s)`, { prefix: '✓' });
        for (const skill of updated) {
          Logger.green(skill, { prefix: '✓', spacing: 2 });
        }
      }

      if (failed.length > 0) {
        Logger.red(`Failed to update ${failed.length} skill(s)`, { prefix: '✗' });
        for (const { skill, error } of failed) {
          Logger.red(`${skill}: ${error}`, { prefix: '✗', spacing: 2 });
        }
        process.exit(1);
      }
    }
  } catch (error) {
    Logger.red('Failed to update', { prefix: '✗' });
    process.exit(1);
  }
};
