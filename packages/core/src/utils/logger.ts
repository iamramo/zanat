import chalk from 'chalk';

export interface Logger {
  info(message: string): void;
  success(message: string): void;
  warning(message: string): void;
  error(message: string, error?: unknown): void;
  dim(message: string): void;
  blank(): void;
}

class ConsoleLogger implements Logger {
  info(message: string): void {
    console.log(chalk.blue(message));
  }

  success(message: string): void {
    console.log(chalk.green(`✓ ${message}`));
  }

  warning(message: string): void {
    console.log(chalk.yellow('•'), message);
  }

  error(message: string, error?: unknown): void {
    if (error instanceof Error) {
      console.error(chalk.red(`✗ ${message}`), error.message);
    } else if (error !== undefined) {
      console.error(chalk.red(`✗ ${message}`), error);
    } else {
      console.error(chalk.red(`✗ ${message}`));
    }
  }

  dim(message: string): void {
    console.log(chalk.gray(message));
  }

  blank(): void {
    console.log();
  }
}

export const logger = new ConsoleLogger();
