import { Command as CommanderCommand, Help, type HookEvent } from 'commander';
import { Log } from './log.js';

class ZanatCommand extends CommanderCommand {
  createCommand(name?: string): ZanatCommand {
    return new ZanatCommand(name);
  }

  hook(
    event: HookEvent,
    listener: (thisCommand: CommanderCommand, actionCommand: CommanderCommand) => void | Promise<void>
  ) {
    return super.hook(event, async (thisCommand, actionCommand) => {
      try {
        await listener(thisCommand, actionCommand);
      } catch (error: any) {
        Log.red(error.message || String(error), { prefix: '✗' });
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
        Log.red(`Failed to run command "${this.name()}". Try setting ZANAT_DEBUG=true.`, {
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
