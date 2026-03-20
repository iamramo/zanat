#!/usr/bin/env node

import { program } from 'commander';
import { initCommand } from './commands/init';
import { syncCommand } from './commands/sync';
import { installCommand } from './commands/install';
import { listCommand } from './commands/list';
import { searchCommand } from './commands/search';

program
  .name('zanat')
  .description('A skill hub for AI agents')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize zanat configuration and clone the hub')
  .action(initCommand);

program
  .command('sync')
  .description('Sync with the hub repository')
  .action(syncCommand);

program
  .command('install <skill>')
  .description('Install a skill (format: source/skill-name)')
  .action(installCommand);

program
  .command('list')
  .description('List installed skills')
  .action(listCommand);

program
  .command('search [query]')
  .description('Search for skills in the hub')
  .action(searchCommand);

program.parse();
