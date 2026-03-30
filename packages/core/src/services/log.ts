import { Chalk } from './chalk.js';
import { Format } from './format.js';

type Prefix = '✓' | '•' | '✗' | '⚠' | '✨';

type Option = {
  prefix?: Prefix;
  spacing?: number;
};

export const Log = {
  msg(message: string, option?: Option): void {
    const spacing = option?.spacing ? ' '.repeat(option.spacing) : '';
    const prefix = option?.prefix ? `${option.prefix} ` : '';
    console.log(`${spacing}${prefix}${message}`);
  },

  blank(): void {
    console.log();
  },

  debug(error: unknown): void {
    if (process.env.ZANAT_DEBUG === 'true') {
      console.error(Chalk.gray(Format.json({ error })));
    }
  },
} as const;
