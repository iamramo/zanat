#!/usr/bin/env node

import './config/env.js';

import { program } from 'commander';
import { initCommand } from './commands/init.js';
import { syncCommand } from './commands/sync.js';
import { installCommand } from './commands/install.js';
import { listCommand } from './commands/list.js';
import { searchCommand } from './commands/search.js';

program.name('zanat').description('A skill hub for AI agents').version('0.1.0');

program
  .command('init')
  .description('Initialize zanat configuration and clone the hub')
  .action(initCommand);

program.command('sync').description('Sync with the hub repository').action(syncCommand);

program
  .command('install <skill>')
  .description('Install a skill (format: source/skill-name)')
  .action(installCommand);

program.command('list').description('List installed skills').action(listCommand);

program.command('search [query]').description('Search for skills in the hub').action(searchCommand);

program.parse();
