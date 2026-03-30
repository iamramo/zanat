import { Git, LockFile, Display, Config, Log, Chalk } from '@iamramo/zanat-core';

export const statusCommand = async (): Promise<void> => {
  // Step 1: Load configuration and skills
  const skills = await LockFile.findAll();
  const skillNames = Object.keys(skills);
  const config = await Config.get();

  // Step 2: Display hub status
  Log.msg(Chalk.blue(Chalk.bold('Hub Status:')));
  Log.blank();
  Log.msg(Chalk.bold('Initialized: ') + Chalk.green('yes'), { prefix: '•', spacing: 2 });
  Log.msg(Chalk.bold('Repository: ') + Chalk.green(config.hubUrl), { prefix: '•', spacing: 2 });
  Log.msg(Chalk.bold('Branch: ') + Chalk.green(config.hubBranch), { prefix: '•', spacing: 2 });
  Log.msg(Chalk.bold(`Directory: `) + Chalk.green(config.hubDir), { prefix: '•', spacing: 2 });
  Log.msg(Chalk.bold('Last pull: ') + Chalk.green(Display.timeAgo(config?.lastPull)), {
    prefix: '•',
    spacing: 2,
  });

  // Check if remote branch exists before trying to get behind count
  const remoteExists = await Git.remoteBranchExists(config.hubBranch);
  if (!remoteExists) {
    Log.msg(Chalk.yellow(`Remote branch 'origin/${config.hubBranch}' not found.`), {
      prefix: '⚠',
      spacing: 2,
    });
    return;
  }

  const behind = await Git.behind(config.hubBranch, `origin/${config.hubBranch}`);
  if (behind === 0) {
    Log.msg(Chalk.bold('Behind: ') + Chalk.bold('up-to-date'), { prefix: '•', spacing: 2 });
  } else {
    Log.msg(Chalk.bold('Behind: ') + Chalk.yellow(`${behind} commit(s)`), { prefix: '•', spacing: 2 });
  }

  // Step 3: Display skills status
  Log.blank();
  Log.msg(Chalk.blue(Chalk.bold('Skills:')));
  Log.blank();

  if (skillNames.length > 0) {
    for (const skillName of skillNames) {
      const skill = await LockFile.find(skillName);
      if (!skill) continue;

      const displayVersion = await Display.getDisplayVersion(skillName);
      const refType = await Git.getRefType(skill.requestedRef);
      let behindStatus = '';

      if (refType === 'branch') {
        try {
          const behindCount = await Git.behind(
            skill.resolvedCommit,
            `origin/${skill.requestedRef}`
          );
          if (behindCount === 0) {
            behindStatus = Chalk.green('[up-to-date]');
          } else {
            behindStatus = Chalk.yellow(`[behind by ${behindCount} commit(s)]`);
          }
        } catch (error) {
          Log.debug(error);
          behindStatus = Chalk.red('[broken]');
        }
      } else {
        behindStatus = Chalk.blue('[static]');
      }

      Log.msg(Chalk.bold(`${skillName} `) + Chalk.blue(`${displayVersion} ${behindStatus}`), {
        prefix: '•',
        spacing: 2,
      });
    }
  } else {
    Log.msg(Chalk.gray('No skills added.'), { spacing: 2 });
  }

  Log.blank();
};
