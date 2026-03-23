import { simpleGit } from 'simple-git';
import { Zod } from './zod.js';
import { Log } from './log.js';

export const Git = {
  async clone(url: string, branch: string, dir: string): Promise<void> {
    Zod.git.UrlSchema.parse(url);
    Zod.git.BranchSchema.parse(branch);
    
    const git = simpleGit();

    try {
      await git.clone(url, dir, ['--branch', branch, '--single-branch']);
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to clone repository.');
    }
  },

  async pull(dir: string): Promise<void> {
    const git = simpleGit(dir);

    try {
      await git.pull();
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to pull repository.');
    }
  },

  async checkout(dir: string, ref: string): Promise<void> {
    Zod.git.RefSchema.parse(ref);
    const git = simpleGit(dir);

    try {
      await git.checkout(ref);
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to checkout.');
    }
  },

  async resolveCommit(dir: string, ref: string): Promise<string> {
    Zod.git.RefSchema.parse(ref);
    const git = simpleGit(dir);

    try {
      const result = await git.revparse([ref]);
      return result.trim();
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to resolve commit.');
    }
  },

  async fetch(dir: string): Promise<void> {
    const git = simpleGit(dir);

    try {
      await git.fetch(['--quiet']);
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to fetch.');
    }
  },

  async raw(dir: string, args: string[]): Promise<string> {
    const git = simpleGit(dir);

    try {
      return await git.raw(args);
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to execute git command.');
    }
  },

  async behind(dir: string, branch: string): Promise<number> {
    Zod.git.BranchSchema.parse(branch);
    await this.fetch(dir);
    const remoteRef = `origin/${branch}`;
    const result = await this.raw(dir, ['rev-list', `${branch}..${remoteRef}`, '--count']);
    return parseInt(result.trim(), 10) || 0;
  },
} as const;
