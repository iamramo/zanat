import chalk from 'chalk';
import { Format } from './format.js';

type Prefix = '✓' | '•' | '✗';

type Option = {
  prefix?: Prefix;
  spacing?: number;
};

export const Log = {
  getPrefix(prefix?: Prefix) {
    return prefix ? `${prefix} ` : '';
  },

  getSpacing(spacing?: number) {
    return spacing ? ' '.repeat(spacing) : '';
  },

  green(message: string, option?: Option): void {
    const spacing = this.getSpacing(option?.spacing);
    const pf = this.getPrefix(option?.prefix);
    console.log(chalk.green(`${spacing}${pf}${message}`));
  },

  red(message: string, option?: Option): void {
    const spacing = this.getSpacing(option?.spacing);
    const pf = this.getPrefix(option?.prefix);
    console.error(chalk.red(`${spacing}${pf}${message}`));
  },

  yellow(message: string, option?: Option): void {
    const spacing = this.getSpacing(option?.spacing);
    const pf = this.getPrefix(option?.prefix);
    console.log(chalk.yellow(`${spacing}${pf}${message}`));
  },

  blue(message: string, option?: Option): void {
    const spacing = this.getSpacing(option?.spacing);
    const pf = this.getPrefix(option?.prefix);
    console.log(chalk.blue(`${spacing}${pf}${message}`));
  },

  gray(message: string, option?: Option): void {
    const spacing = this.getSpacing(option?.spacing);
    const pf = this.getPrefix(option?.prefix);
    console.log(chalk.gray(`${spacing}${pf}${message}`));
  },

  blank(): void {
    console.log();
  },

  bold(message: string): string {
    return chalk.bold(message);
  },

  debug(error: unknown): void {
    if (process.env.ZANAT_DEBUG === 'true') {
      console.error(chalk.gray(Format.json({ error })));
    }
  },
} as const;
