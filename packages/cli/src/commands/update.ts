import {
  Config,
  CommitShaSchema,
  Log,
  Prompt,
  LockFile,
  Display,
  Path,
  Skill,
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
        Log.red('Invalid commit SHA format. Must be 7-40 hexadecimal characters.', {
          prefix: '✗',
        });
        process.exit(1);
      }
    }

    // Cannot use --commit when updating all skills
    if (options.commit && !skillArg) {
      Log.red('Cannot use --commit when updating all skills. Please specify a specific skill.', {
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
            const shouldContinue = await Prompt.confirm({
              message: `Skill ${skillArg} is pinned to ${shortSha}. This will update to ${branchName} and unpin. Continue?`,
              default: true,
            });

            if (!shouldContinue) {
              Log.blue('Update cancelled');
              return;
            }
          }
        }
      }

      Log.blue(`Updating skill: ${skillArg}...`);
      await Skill.update(namespace, skillName);

      if (options.commit) {
        Log.green(`Updated ${skillArg} and pinned to ${options.commit.slice(0, 7)}`, {
          prefix: '✓',
        });
      } else {
        Log.green(`Updated ${skillArg}`, { prefix: '✓' });
      }
    } else {
      // Update all skills
      const skills = await LockFile.findAll();
      const addedSkills = Object.keys(skills);

      if (addedSkills.length === 0) {
        Log.blue('No skills to update');
        return;
      }

      if (!options.yes) {
        const shouldUpdate = await Prompt.confirm({
          message: `This will update ${addedSkills.length} skill(s). Continue?`,
          default: true,
        });

        if (!shouldUpdate) {
          Log.blue('Update cancelled');
          return;
        }
      }

      Log.blue(`Updating ${addedSkills.length} skill(s)...`);
      await Skill.updateAll();
      Log.green('Updated all skills', { prefix: '✓' });
    }
  } catch {
    Log.red('Failed to update', { prefix: '✗' });
    process.exit(1);
  }
};
