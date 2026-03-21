import { Command } from 'commander';

export { Command };

export const createProgram = (): Command => {
  return new Command();
};
