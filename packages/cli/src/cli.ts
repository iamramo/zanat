import { program } from 'commander';
import { initCommand } from './commands/init.js';
import { syncCommand } from './commands/sync.js';
import { addCommand } from './commands/add.js';
import { removeCommand } from './commands/remove.js';
import { listCommand } from './commands/list.js';
import { searchCommand } from './commands/search.js';

program.name('zanat').description('A skill hub for AI agents').version('0.4.2');

program
  .command('init')
  .description('Initialize zanat configuration and clone the hub')
  .action(initCommand);

program.command('sync').description('Sync with the hub repository').action(syncCommand);

program
  .command('add <skill>')
  .description('Add a skill (format: source/skill-name)')
  .action(addCommand);

program
  .command('remove <skill>')
  .description('Remove a skill (format: source/skill-name)')
  .action(removeCommand);

program.command('list').description('List added skills').action(listCommand);

program.command('search [query]').description('Search for skills in the hub').action(searchCommand);

program.parse();
