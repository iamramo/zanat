import {
  Display,
  Command,
  Config,
  Zod,
  Chalk,
  HubSkill,
  Git,
  LockFile,
  Path,
  Prompt,
  Log,
  Node,
} from '@iamramo/zanat-core';
import packageJson from '../package.json' with { type: 'json' };

Node.checkVersion(parseInt(packageJson.engines.node.replace('>=', ''), 10));
import { initCommand } from './commands/init.js';
import { pullCommand } from './commands/pull.js';
import { addCommand } from './commands/add.js';
import { rmCommand } from './commands/rm.js';
import { updateCommand } from './commands/update.js';
import { listCommand } from './commands/list.js';
import { searchCommand } from './commands/search.js';
import { statusCommand } from './commands/status.js';
import { showCommand } from './commands/show.js';
import { PinOptionSchema } from './schemas/pin.js';

const program = Command.create();

program
  .name('zanat')
  .description('Your personal skill library from any Git repository.')
  .version(packageJson.version, '-V, --version', 'Output the version number')
  .helpOption('-h, --help', 'Display help for command')
  .option('-d, --debug', 'Enable debug output for troubleshooting')
  .passThroughOptions();
program.helpCommand(false);

program.configureHelp({
  formatHelp: (cmd) => {
    const originalHelp = new Command.help().formatHelp(cmd, program.createHelp());
    // Only show banner and version for main help, not command-specific help
    if (cmd.name() === 'zanat' && !cmd.parent) {
      return (
        Chalk.white(Display.getAsciiBanner()) +
        '\n' +
        Chalk.gray(`v${packageJson.version}`) +
        '\n\n' +
        Chalk.bold(originalHelp)
      );
    }
    return Chalk.bold(originalHelp);
  },
  styleDescriptionText: (str) => Chalk.reset(Chalk.italic.dim(str)),
  styleCommandDescription: (str) => Chalk.white(str),
  styleArgumentDescription: (str) => Chalk.reset(Chalk.italic.dim(str)),
  styleOptionTerm: (str) => Chalk.white(str),
  styleTitle: (str) => Chalk.blue(str),
  styleOptionText: (str) => Chalk.reset(Chalk.italic.dim(str)),
  styleArgumentText: (str) => Chalk.reset(Chalk.italic.dim(str)),
  styleArgumentTerm: (str) => Chalk.reset(Chalk.italic.dim(str)),
  styleSubcommandTerm: (str) => Chalk.white(str),
  styleSubcommandDescription: (str) => Chalk.reset(Chalk.italic.dim(str)),
  styleUsage: (str) => Chalk.white(str),
});

program.hook('preAction', async (thisCommand, actionCommand) => {
  const cmd = actionCommand.name();
  const args = actionCommand.args;
  const opts = actionCommand.opts();
  const parentOpts = thisCommand.opts();

  if (opts.debug || parentOpts.debug) {
    process.env.ZANAT_DEBUG = 'true';
  }

  switch (cmd) {
    case 'init':
      // No validation
      return;

    case 'add': {
      // Validate config
      await Config.validate();

      // Ensure on hubBranch
      await Config.ensureOnHubBranch();

      // Ensure fullSkillName is in correct format
      const fullSkillName = args[0]!;
      Zod.skill.FullSchema.shape.fullName.parse(fullSkillName);

      // Ensure if needs to be updated instead
      const skillLockExists = !!(await LockFile.find(fullSkillName));
      if (skillLockExists) {
        if (await LockFile.isPinned(fullSkillName)) {
          Log.msg(Chalk.yellow(`Skill '${fullSkillName}' is already added and pinned.`));
          process.exit(0);
        }

        const shouldUpdate = await Prompt.confirm({
          message: `Skill ${fullSkillName} is already added. Update from hub?`,
          default: true,
        });

        if (!shouldUpdate) process.exit(0);

        await updateCommand(fullSkillName);
        process.exit(0);
      }

      // Ensure skill exists in hub
      const pin = opts.pin;
      PinOptionSchema.parse(opts.pin);

      if (!pin) {
        const hubSkill = await HubSkill.find(fullSkillName);
        if (!hubSkill) throw new Error(`Skill '${fullSkillName}' not found in hub.`);
      }

      // Ensure up-to-date branch
      if (pin) {
        const refType = await Git.getRefType(pin);
        if (refType === 'branch')
          throw new Error(`Branch pinning is not supported. Use a tag or commit SHA.`);
      } else {
        await Git.pull();
      }

      // When pinned, verify skill exists at that ref
      if (pin) {
        const sourceFile = await Path.getHubSkillPath(fullSkillName, true);
        try {
          await Git.show(pin, sourceFile);
        } catch {
          throw new Error(`Skill '${fullSkillName}' does not exist at ref '${pin}'.`);
        }
      }

      return;
    }

    case 'update': {
      // Validate config
      await Config.validate();

      // Ensure on hubBranch
      await Config.ensureOnHubBranch();

      const config = await Config.get();
      const lockFileSkills = await LockFile.findAll();
      let hasPulled = false;

      const individualValidationLogic = async (name: string) => {
        // Ensure fullSkillName is in correct format
        Zod.skill.FullSchema.shape.fullName.parse(name);

        // Ensure skill exists in hub
        const hubSkill = await HubSkill.find(name);
        if (!hubSkill) throw new Error(`Skill '${name}' not found in hub.`);

        // Ensure skill exists in lock file
        const lockFileSkill = lockFileSkills[name];
        if (!lockFileSkill) throw new Error(`Skill '${name}' not found in lock file.`);

        // Ensure up-to-date hub branch (pull once)
        if (lockFileSkill.requestedRef === config.hubBranch && !hasPulled) {
          await Git.pull();
          hasPulled = true;
        }
      };

      Log.msg(Chalk.blue(`Checking skill(s) for updates...`));
      if (args[0]) {
        await individualValidationLogic(args[0]);
      } else {
        const skillNames = Object.keys(lockFileSkills);
        if (skillNames.length === 0) {
          Log.msg(Chalk.blue('No skills to update'));
          process.exit(0);
        }
        for (const skillName of skillNames) {
          await individualValidationLogic(skillName);
        }
      }

      return;
    }

    case 'pull':
      // Validate config
      await Config.validate();

      // Ensure on hubBranch
      await Config.ensureOnHubBranch();

      return;

    case 'rm': {
      // Validate config
      await Config.validate({ remote: false });

      // Ensure fullSkillName is in correct format
      const fullSkillName = args[0]!;
      Zod.skill.FullSchema.shape.fullName.parse(fullSkillName);

      // Ensure skill exists in the lock file
      const lockFileSkill = await LockFile.find(fullSkillName);
      if (!lockFileSkill) throw new Error(`Skill '${fullSkillName}' not found in lock file.`);

      return;
    }

    case 'show': {
      // Validate config
      await Config.validate();

      // Ensure on hubBranch
      await Config.ensureOnHubBranch();

      // Ensure fullSkillName is in correct format
      Zod.skill.FullSchema.shape.fullName.parse(args[0]);

      return;
    }

    case 'list':
      // Validate config
      await Config.validate({ remote: false });

      return;

    case 'search':
      // Validate config
      await Config.validate();

      // Ensure on hubBranch
      await Config.ensureOnHubBranch();

      return;

    case 'status':
      // Validate config
      await Config.validate();

      // Ensure on hubBranch
      await Config.ensureOnHubBranch();

      // Ensure we have the latest information
      {
        const hubBranch = (await Config.get()).hubBranch;
        await Git.fetch([hubBranch]);
      }

      return;
  }
});

program
  .command('init')
  .description('Initialize zanat configuration and clone the hub')
  .addHelpText(
    'after',
    Chalk.italic.dim(`
Examples:
  $ zanat init
    Interactive setup for first-time use

  $ zanat init
    (when already initialized)
    Prompts to reinitialize or keep existing setup

Interactive Prompts:
  • Hub repository URL - Git URL of your skills repository
  • Hub branch - Branch to track (default: main)
  • Hub directory - Local path to clone repository

Note:
  Reinitializing removes the hub directory but keeps added skills safe.
  You'll need to re-add skills to re-pin them to the new hub branch.
`)
  )
  .action(initCommand);

program
  .command('pull')
  .description('Pull latest changes from hub repository')
  .addHelpText(
    'after',
    Chalk.italic.dim(`
Examples:
  $ zanat pull
    Pull latest changes from the hub branch

Behavior:
  • Pulls the configured hub branch (fast-forward)
  • Updates the lastPull timestamp
`)
  )
  .action(pullCommand);

program
  .command('add <skill>')
  .description('Add a skill')
  .option(
    '-p, --pin <ref>',
    'Pin to a specific tag or commit SHA. Requires a value (e.g., --pin=v1.0.0, --pin=abc123).'
  )
  .addHelpText(
    'after',
    Chalk.italic.dim(`
Examples:
  $ zanat add vercel.react-patterns
    Add a skill and track the hub branch (auto-updates)

  $ zanat add vercel.react-patterns --pin=v1.2.0
    Pin to tag v1.2.0 (never auto-updates)

  $ zanat add vercel.react-patterns --pin=abc1234
    Pin to specific commit (never auto-updates)

  $ zanat add vercel.react-patterns --pin
    Error: --pin requires a value

Notes:
  • Without --pin, the skill tracks the hub branch and updates with 'zanat update'
  • With --pin, the skill is locked to that tag or commit and never auto-updates
  • Re-add a skill without --pin to switch it back to tracking the hub branch
`)
  )
  .action(addCommand);

program
  .command('rm <skill>')
  .description('Remove a skill')
  .addHelpText(
    'after',
    Chalk.italic.dim(`
Examples:
  $ zanat rm vercel.react-patterns
    Remove a skill from local storage

Note:
  Removes the skill files from ~/.agents/skills/ and removes the lock file entry.
  The skill can be re-added at any time with 'zanat add'.
`)
  )
  .action(rmCommand);

program
  .command('update [skill]')
  .description('Update skill(s) from hub')
  .addHelpText(
    'after',
    Chalk.italic.dim(`
Examples:
  $ zanat update
    Update all skills to their latest versions (interactive)

  $ zanat update vercel.react-patterns
    Update a specific skill

Behavior:
  • Shows orphaned skills (ref deleted but commit preserved)
  • Shows broken skills (neither ref nor commit exist)
  • Only updates skills with 'ok' status
  • Preserves commits for orphaned skills
  • Re-pins skills when you explicitly re-add them
`)
  )
  .action(updateCommand);

program
  .command('list')
  .description('List added skills')
  .addHelpText(
    'after',
    Chalk.italic.dim(`
Examples:
  $ zanat list
    List all added skills with their versions

Output Format:
  • skill-name abc1234 (main)        - Tracking hub branch
  • skill-name abc1234 (v1.2.0)      - Pinned to tag
  • skill-name abc1234 (orphaned)    - Ref deleted, commit preserved
  • skill-name abc1234 (broken)      - Neither ref nor commit exist

Note:
  Shows the short commit SHA and the requested ref in parentheses.
  Use 'zanat status' for more detailed information.
`)
  )
  .action(listCommand);

program
  .command('search [query]')
  .description('Search for skills in the hub')
  .addHelpText(
    'after',
    Chalk.italic.dim(`
Examples:
  $ zanat search
    List all available skills

  $ zanat search react
    Search for skills matching "react"

Note:
  Search matches against skill names and descriptions.
  Results show skill names with truncated descriptions.
`)
  )
  .action(searchCommand);

program
  .command('show <skill>')
  .description('Show skill content')
  .addHelpText(
    'after',
    Chalk.italic.dim(`
Examples:
  $ zanat show vercel.react-patterns
    Display the full content of the skill from current hub branch

Note:
  Shows the raw SKILL.md content of the skill.
  By default, shows content from the current hub branch filesystem.
`)
  )
  .action(showCommand);

program
  .command('status')
  .description('Show hub and skills status')
  .addHelpText(
    'after',
    Chalk.italic.dim(`
Examples:
  $ zanat status
    Show hub configuration and all skill statuses

Output:
  • Hub URL and branch configuration
  • Last pull timestamp
  • Commits behind remote (if any)
  • List of all skills with their resolved commit and ref status

Status Indicators:
  • "abc1234 (main)"        - Tracking hub branch, up to date
  • "abc1234 (v1.2.0)"      - Pinned to tag v1.2.0
  • "abc1234 (orphaned)"    - Ref deleted but commit preserved
  • "abc1234 (broken)"      - Neither ref nor commit exist
`)
  )
  .action(statusCommand);

program.parse();
