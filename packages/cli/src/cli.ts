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
    return Display.getAsciiBanner() + '\n' + originalHelp;
  },
});

program
  .command('init')
  .description('Initialize zanat configuration and clone the hub')
  .action(initCommand);

program.command('pull').description('Pull latest changes from hub repository').action(pullCommand);

program
  .command('add <skill>')
  .description('Add a skill (format: namespace.skill-name or namespace.sub.skill-name)')
  .action(addCommand);

program
  .command('rm <skill>')
  .description('Remove a skill (format: namespace.skill-name or namespace.sub.skill-name)')
  .action(removeCommand);

program
  .command('update [skill]')
  .description('Update skill(s) from hub (updates all if no skill specified)')
  .action(updateCommand);

program.command('list').description('List added skills').action(listCommand);

program.command('search [query]').description('Search for skills in the hub').action(searchCommand);

program.command('status').description('Show hub and skills status').action(statusCommand);

program.parse();
