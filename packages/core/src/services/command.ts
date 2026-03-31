import { Command as CommanderCommand, Help, type HookEvent } from 'commander';
import { ZodError } from 'zod';
import { Log } from './log.js';
import { Chalk } from './chalk.js';
import { Format } from './format.js';

class ZanatCommand extends CommanderCommand {
  createCommand(name?: string): ZanatCommand {
    const cmd = new ZanatCommand(name);
    cmd.option('-d, --debug', 'Enable debug output');
    return cmd;
  }

  hook(
    event: HookEvent,
    listener: (
      thisCommand: CommanderCommand,
      actionCommand: CommanderCommand
    ) => void | Promise<void>
  ) {
    return super.hook(event, async (thisCommand, actionCommand) => {
      try {
        await listener(thisCommand, actionCommand);
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'ExitPromptError') {
          Log.msg(Chalk.blue('Cancelled.'));
          process.exit(0);
        }
        let message: string;
        if (error instanceof ZodError) {
          message = error.issues[0]?.message ?? 'Validation failed';
        } else if (error instanceof Error) {
          message = error.message;
        } else {
          message = Format.json(error);
        }
        Log.msg(Chalk.red(message), { prefix: '✗' });
        Log.debug(error);
        process.exit(1);
      }
    });
  }

  action(fn: (...args: any[]) => Promise<void> | void) {
    const wrappedFn = async (...args: any[]) => {
      try {
        await fn(...args);
      } catch (error) {
        if (error instanceof Error && error.name === 'ExitPromptError') {
          Log.msg(Chalk.blue('Cancelled.'));
          process.exit(0);
        }
        Log.msg(Chalk.red(`Failed to run command "${this.name()}". Try running with --debug.`), {
          prefix: '✗',
        });
        Log.debug(error);
        process.exit(1);
      }
    };
    return super.action(wrappedFn);
  }
}

export const Command = {
  create(): ZanatCommand {
    return new ZanatCommand();
  },
  help: Help,
};
