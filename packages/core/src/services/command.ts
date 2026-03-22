import { Command as CommanderCommand } from 'commander';

export const Command = {
  create(): CommanderCommand {
    return new CommanderCommand();
  },
};