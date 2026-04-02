import { Git, LockFile, Display, Config, Log, Chalk } from '@iamramo/zanat-core';

export const statusCommand = async (): Promise<void> => {
  // Step 1: Load configuration and skills
  const skills = await LockFile.findAll();
  const skillNames = Object.keys(skills);
  const config = await Config.get();

  // Step 2: Display hub status
  Log.msg(Chalk.blue(Chalk.bold('Hub Status:')));
  Log.blank();
  Log.msg(Chalk.bold('Initialized: ') + Chalk.green('yes'), {
    prefix: '•',
    prefixColor: 'white',
    spacing: 2,
  });
  Log.msg(Chalk.bold('Repository: ') + Chalk.green(config.url), {
    prefix: '•',
    prefixColor: 'white',
    spacing: 2,
  });
  Log.msg(Chalk.bold('Branch: ') + Chalk.green(config.branch), {
    prefix: '•',
    prefixColor: 'white',
    spacing: 2,
  });
  Log.msg(Chalk.bold(`Directory: `) + Chalk.green(config.dir), {
    prefix: '•',
    prefixColor: 'white',
    spacing: 2,
  });
  Log.msg(Chalk.bold('Last pull: ') + Chalk.green(Display.timeAgo(config?.lastPull)), {
    prefix: '•',
    prefixColor: 'white',
    spacing: 2,
  });

  try {
    const behind = await Git.behind(config.branch, `origin/${config.branch}`);
    if (behind === 0) {
      Log.msg(Chalk.bold('Behind: ') + Chalk.green('up-to-date'), {
        prefix: '•',
        prefixColor: 'white',
        spacing: 2,
      });
    } else {
      Log.msg(Chalk.bold('Behind: ') + Chalk.yellow(`${behind} commit(s)`), {
        prefix: '•',
        prefixColor: 'white',
        spacing: 2,
      });
    }
  } catch (error) {
    Log.msg(Chalk.bold('Behind: ') + Chalk.gray('unknown'), {
      prefix: '•',
      prefixColor: 'white',
      spacing: 2,
    });
    Log.debug(error);
  }

  // Step 3: Display skills status
  Log.blank();
  Log.msg(Chalk.blue(Chalk.bold('Skills:')));
  Log.blank();

  if (skillNames.length > 0) {
    for (const skillName of skillNames) {
      const displayVersion = await Display.getDisplayVersion(skillName);
      const pinned = await LockFile.isPinned(skillName);

      let behindStatus = '';
      if (!pinned) {
        try {
          const behindCount = await Git.behind(
            skills[skillName]!.resolvedCommit,
            `origin/${config.branch}`
          );
          behindStatus =
            behindCount === 0
              ? Chalk.green('[up-to-date]')
              : Chalk.yellow(`[behind by ${behindCount} commit(s)]`);
        } catch (error) {
          Log.debug(error);
        }
      }

      Log.msg(
        Chalk.bold(`${skillName} `) + Chalk.blue(`${displayVersion} ${behindStatus}`.trim()),
        {
          prefix: '•',
          prefixColor: 'white',
          spacing: 2,
        }
      );
    }
  } else {
    Log.msg(Chalk.gray('No skills added.'), { spacing: 2 });
  }

  Log.blank();
};
