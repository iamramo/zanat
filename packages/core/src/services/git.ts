import { simpleGit } from 'simple-git';
import { Zod } from './zod.js';
import { Log } from './log.js';
import { Config } from './config.js';
import { GIT_COMMIT_SHA_REGEX } from '../schemas/common.js';

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
      throw new Error('Failed to git pull.');
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

  async fetch(refs: string[]): Promise<void> {
    const config = await Config.get();
    const git = simpleGit(config.hubDir);

    if (refs.length === 0) throw new Error('Missing refs');

    try {
      await git.fetch(['origin', ...refs]);
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to fetch.');
    }
  },

  async behind(from: string, to: string): Promise<number> {
    const config = await Config.get();
    const git = simpleGit(config.hubDir);

    try {
      const result = await git.raw(['rev-list', `${from}..${to}`, '--count']);
      return parseInt(result.trim(), 10) || 0;
    } catch (error) {
      Log.debug(error);
      throw new Error('Failed to count between commits.');
    }
  },

  async getRefType(ref: string): Promise<'sha' | 'tag' | 'branch'> {
    if (GIT_COMMIT_SHA_REGEX.test(ref)) {
      return 'sha';
    }

    const config = await Config.get();
    const git = simpleGit(config.hubDir);

    try {
      await git.revparse(['--verify', `refs/tags/${ref}`]);
      return 'tag';
    } catch {
      return 'branch';
    }
  },

  async remoteBranchExists(branch: string): Promise<boolean> {
    Zod.git.BranchSchema.parse(branch);
    const config = await Config.get();
    const git = simpleGit(config.hubDir);

    try {
      const result = (
        await git.listRemote(['--refs', '--heads', '--tags', config.hubUrl, branch])
      ).trim();
      return result.length > 0;
    } catch {
      return false;
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
} as const;
