import chalk from 'chalk';
import { Format } from './format.js';

type Prefix = '✓' | '•' | '✗' | '⚠' | '✨';

type Option = {
  prefix?: Prefix;
  spacing?: number;
  newline?: boolean;
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
    console.log(this.bold(chalk.green(`${spacing}${pf}${message}`)));
  },

  red(message: string, option?: Option): void {
    const spacing = this.getSpacing(option?.spacing);
    const pf = this.getPrefix(option?.prefix);
    console.error(this.bold(chalk.red(`${spacing}${pf}${message}`)));
  },

  yellow(message: string, option?: Option): void {
    const spacing = this.getSpacing(option?.spacing);
    const pf = this.getPrefix(option?.prefix);
    console.log(this.bold(chalk.yellow(`${spacing}${pf}${message}`)));
  },

  blue(message: string, option?: Option): void {
    const spacing = this.getSpacing(option?.spacing);
    const pf = this.getPrefix(option?.prefix);
    console.log(this.bold(chalk.blue(`${spacing}${pf}${message}`)));
  },

  gray(message: string, option?: Option): void {
    const spacing = this.getSpacing(option?.spacing);
    const pf = this.getPrefix(option?.prefix);
    console.log(this.bold(chalk.gray(`${spacing}${pf}${message}`)));
  },

  white(message: string, option?: Option): void {
    const spacing = this.getSpacing(option?.spacing);
    const pf = this.getPrefix(option?.prefix);
    console.log(this.bold(chalk.white(`${spacing}${pf}${message}`)));
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

  status(
    label: string,
    value: string,
    color: 'green' | 'yellow' | 'red' | 'blue' | 'gray',
    option?: Option
  ): void {
    const spacing = this.getSpacing(option?.spacing);
    const pf = this.getPrefix(option?.prefix);
    const labelStr = `${spacing}${pf}${label} `;
    const valueStr = chalk[color](value);
    console.log(this.bold(`${labelStr}${valueStr}`));
  },
} as const;
