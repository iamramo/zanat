import { Command as CommanderCommand, Help } from 'commander';

export const Command = {
  create(): CommanderCommand {
    return new CommanderCommand();
  },
  help: Help,
};