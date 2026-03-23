import fs from 'fs-extra';
import { glob } from 'node:fs/promises';
import { Log } from './log.js';

export const Fs = {
  async exists(dir: string): Promise<boolean> {
    return await fs.pathExists(dir);
  },
  async remove(dir: string): Promise<void> {
    try {
      await fs.remove(dir);
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to remove file or directory.');
    }
  },
  async ensureDir(dir: string): Promise<void> {
    try {
      await fs.ensureDir(dir);
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to create directory.');
    }
  },
  async copy(source: string, destination: string): Promise<void> {
    try {
      await fs.copy(source, destination);
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to copy file or directory.');
    }
  },
  async writeFile(file: string, data: string): Promise<void> {
    try {
      await fs.writeFile(file, data);
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to write file.');
    }
  },
  async readFile(file: string): Promise<string> {
    try {
      return await fs.readFile(file, 'utf-8');
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to read file.');
    }
  },

  async glob(pattern: string, cwd?: string): Promise<string[]> {
    try {
      const results: string[] = [];
      for await (const file of glob(pattern, { cwd })) {
        results.push(file);
      }
      return results;
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to glob files.');
    }
  },
} as const;
