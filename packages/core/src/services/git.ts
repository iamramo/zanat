import { simpleGit } from 'simple-git';
import { Zod } from './zod.js';
import { Log } from './log.js';
import { Config } from './config.js';

export const Git = {
  async clone(url: string, branch: string, dir: string): Promise<void> {
    Zod.git.UrlSchema.parse(url);
    Zod.git.BranchSchema.parse(branch);
    
    const git = simpleGit();

    try {
      await git.clone(url, dir, ['--branch', branch]);
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to clone repository.');
    }
  },

  async pull(): Promise<void> {
    const config = await Config.get();
    const git = simpleGit(config.hubDir);

    try {
      await git.pull();
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to pull repository.');
    }
  },

  async checkout(ref: string): Promise<void> {
    Zod.git.RefSchema.parse(ref);
    const config = await Config.get();
    const git = simpleGit(config.hubDir);

    try {
      await git.checkout(ref);
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to checkout.');
    }
  },

  async resolveCommit(ref: string): Promise<string> {
    Zod.git.RefSchema.parse(ref);
    const config = await Config.get();
    const git = simpleGit(config.hubDir);

    try {
      const result = await git.revparse([ref]);
      return result.trim();
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to resolve commit.');
    }
  },

  async fetch(refs?: string[]): Promise<void> {
    const config = await Config.get();
    const git = simpleGit(config.hubDir);

    try {
      if (refs && refs.length > 0) {
        // Fetch specific refs
        await git.fetch(['origin', ...refs]);
      } else {
        // Regular fetch all
        await git.fetch(['--quiet']);
      }
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to fetch.');
    }
  },

  async raw(args: string[]): Promise<string> {
    const config = await Config.get();
    const git = simpleGit(config.hubDir);

    try {
      return await git.raw(args);
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to execute git command.');
    }
  },

  async behind(branch: string): Promise<number> {
    Zod.git.BranchSchema.parse(branch);
    await this.fetch([branch]);
    const remoteRef = `origin/${branch}`;
    const result = await this.raw(['rev-list', `${branch}..${remoteRef}`, '--count']);
    return parseInt(result.trim(), 10) || 0;
  },

  async lsRemote(url: string, ref: string): Promise<string> {
    Zod.git.UrlSchema.parse(url);
    Zod.git.RefSchema.parse(ref);
    const git = simpleGit();

    try {
      const result = (await git.listRemote(['--refs', '--heads', '--tags', url, ref])).trim();
      if (!result) {
        throw new Error('Ref not found');
      }
      return result;
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to list remote refs.');
    }
  },

  async getCurrentBranch(): Promise<string> {
    const config = await Config.get();
    const git = simpleGit(config.hubDir);
    try {
      const result = await git.revparse(['--abbrev-ref', 'HEAD']);
      return result.trim();
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to get current branch.');
    }
  },

  async show(ref: string, filePath: string): Promise<string> {
    Zod.git.RefSchema.parse(ref);
    const config = await Config.get();
    const git = simpleGit(config.hubDir);

    try {
      const result = await git.show(`${ref}:${filePath}`);
      return result;
    } catch (error) {
      Log.debug(error);
      throw new Error(`Failed to show file ${filePath} at ${ref}.`);
    }
  },

  async remoteBranchExists(branch: string): Promise<boolean> {
    Zod.git.BranchSchema.parse(branch);
    const config = await Config.get();

    try {
      // Use ls-remote to check actual remote, works with single-branch clones
      const result = await this.lsRemote(config.hubUrl, branch);
      return result.length > 0;
    } catch {
      return false;
    }
  },
} as const;
