import { Chalk } from './chalk.js';
import { Format } from './format.js';

type Prefix = '✔' | '•' | '✗' | '⚠' | '✨';
type PrefixColor = 'green' | 'red' | 'yellow' | 'blue' | 'white' | 'gray';

const DEFAULT_PREFIX_COLORS: Record<Prefix, PrefixColor> = {
  '✔': 'green',
  '✗': 'red',
  '⚠': 'yellow',
  '✨': 'white',
  '•': 'gray',
};

type Option = {
  prefix?: Prefix;
  prefixColor?: PrefixColor;
  spacing?: number;
};

export const Log = {
  msg(message: string, option?: Option): void {
    const spacing = option?.spacing ? ' '.repeat(option.spacing) : '';
    let prefix = '';
    if (option?.prefix) {
      const color = option.prefixColor ?? DEFAULT_PREFIX_COLORS[option.prefix];
      prefix = `${Chalk[color](option.prefix)} `;
    }
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
