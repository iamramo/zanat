import { Command as CommanderCommand, Help } from 'commander';
import { Display } from '@iamramo/zanat-core';
import packageJson from '../package.json' with { type: 'json' };
import { initCommand } from './commands/init.js';
import { pullCommand } from './commands/pull.js';
import { addCommand } from './commands/add.js';
import { removeCommand } from './commands/remove.js';
import { updateCommand } from './commands/update.js';
import { listCommand } from './commands/list.js';
import { searchCommand } from './commands/search.js';
import { statusCommand } from './commands/status.js';

const program = new CommanderCommand();
program.name('zanat').description('Your personal skill library from any Git repository').version(packageJson.version);
program.helpCommand(false);

program.configureHelp({
  formatHelp: (cmd) => {
    const originalHelp = new Help().formatHelp(cmd, program.createHelp());
    // Only show banner for main help, not command-specific help
    if (cmd.name() === 'zanat' && !cmd.parent) {
      return Display.getAsciiBanner() + '\n' + originalHelp;
    }
    return originalHelp;
  },
});

program
  .command('init')
  .description('Initialize zanat configuration and clone the hub')
  .addHelpText(
    'after',
    `
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
`
  )
  .action(initCommand);

program
  .command('pull')
  .description('Pull latest changes from hub repository')
  .addHelpText(
    'after',
    `
Examples:
  $ zanat pull
    Pull hub branch and fetch all skill refs

Behavior:
  • Pulls the configured hub branch (fast-forward)
  • Fetches all unique refs used by pinned skills
  • Reports successfully fetched refs
  • Warns about refs that could not be fetched (may be deleted)
  • Shows which skills are affected by failed fetches
  • Always updates the lastPull timestamp

Note:
  This command fetches refs for all skills to ensure 'zanat update' works correctly,
  even for skills pinned to branches other than the hub branch.
`
  )
  .action(pullCommand);

program
  .command('add <skill>')
  .description('Add a skill (format: namespace.skill-name or namespace.sub.skill-name)')
  .option(
    '-p, --pin <ref>',
    'Pin to a specific ref (branch, tag, or commit SHA). Requires a value (e.g., --pin=main, --pin=v1.0.0, --pin=abc123).'
  )
  .addHelpText(
    'after',
    `
Examples:
  $ zanat add vercel.react-patterns
    Add a skill and track the hub branch (auto-updates)

  $ zanat add vercel.react-patterns --pin=main
    Pin to 'main' branch (follows branch updates, not hub branch)

  $ zanat add vercel.react-patterns --pin=develop
    Pin to 'develop' branch (follows branch updates)

  $ zanat add vercel.react-patterns --pin=v1.2.0
    Pin to tag v1.2.0 (never auto-updates)

  $ zanat add vercel.react-patterns --pin=abc1234
    Pin to specific commit (never auto-updates)

  $ zanat add vercel.react-patterns --pin
    Error: --pin requires a value

Notes:
  • Without --pin, the skill tracks the hub branch and updates with 'zanat update'
  • With --pin, the skill is locked to that ref and never auto-updates
  • Use --pin when you need stability or want to follow a specific branch/tag
  • Re-add a skill without --pin to switch it back to tracking the hub branch
`
  )
  .action(addCommand);

program
  .command('rm <skill>')
  .description('Remove a skill (format: namespace.skill-name or namespace.sub.skill-name)')
  .addHelpText(
    'after',
    `
Examples:
  $ zanat rm vercel.react-patterns
    Remove a skill from local storage

Note:
  Removes the skill files from ~/.agents/skills/ and removes the lock file entry.
  The skill can be re-added at any time with 'zanat add'.
`
  )
  .action(removeCommand);

program
  .command('update [skill]')
  .description('Update skill(s) from hub (updates all if no skill specified)')
  .addHelpText(
    'after',
    `
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
`
  )
  .action(updateCommand);

program
  .command('list')
  .description('List added skills')
  .addHelpText(
    'after',
    `
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
`
  )
  .action(listCommand);

program
  .command('search [query]')
  .description('Search for skills in the hub')
  .addHelpText(
    'after',
    `
Examples:
  $ zanat search
    List all available skills

  $ zanat search react
    Search for skills matching "react"

Note:
  Search matches against skill names and descriptions.
  Results show skill names with truncated descriptions.
`
  )
  .action(searchCommand);

program
  .command('status')
  .description('Show hub and skills status')
  .addHelpText(
    'after',
    `
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
`
  )
  .action(statusCommand);

program.parse();
