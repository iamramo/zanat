import { simpleGit } from 'simple-git';
import { getHubDir } from '../utils/paths.js';
import fs from 'fs-extra';
import path from 'node:path';
import { loadConfig } from './config.js';

export interface HubStatus {
  initialized: boolean;
  behind: number;
  remoteUrl?: string;
  branch?: string;
}

export const cloneHub = async (hubUrl: string, branch: string, hubDir: string): Promise<string> => {
  await fs.ensureDir(path.dirname(hubDir));
  const git = simpleGit();

  try {
    await git.clone(hubUrl, hubDir, ['--branch', branch, '--single-branch']);
    return branch;
  } catch (error) {
    console.error('Clone error:', error);
    if (branch === 'main') {
      console.log(`Branch 'main' not found, trying 'master'...`);
      try {
        await git.clone(hubUrl, hubDir, ['--branch', 'master', '--single-branch']);
        return 'master';
      } catch (error2) {
        console.error('Clone error (master):', error2);
        throw new Error(`Failed to clone repository. Neither 'main' nor 'master' branch found.`);
      }
    }
    throw error;
  }
};

export const pullHub = async (): Promise<void> => {
  const hubDir = await getHubDir();
  const git = simpleGit(hubDir);
  await git.pull();
};

export const isHubCloned = async (): Promise<boolean> => {
  const hubDir = await getHubDir();
  return fs.pathExists(`${hubDir}/.git`);
};

export const getHubStatus = async (): Promise<HubStatus> => {
  const initialized = await isHubCloned();

  if (!initialized) {
    return { initialized: false, behind: 0 };
  }

  const config = await loadConfig();
  const hubDir = await getHubDir();
  const git = simpleGit(hubDir);

  try {
    await git.fetch(['--quiet']);

    const localBranch = config?.hubBranch || 'main';
    const remoteRef = `origin/${localBranch}`;

    const result = await git.raw(['rev-list', `${localBranch}..${remoteRef}`, '--count']);
    const behind = parseInt(result.trim(), 10) || 0;

    const remotes = await git.getRemotes(true);
    const remoteUrl = remotes.find((r) => r.name === 'origin')?.refs.fetch;

    return {
      initialized: true,
      behind,
      remoteUrl,
      branch: localBranch,
    };
  } catch {
    return { initialized: true, behind: 0 };
  }
};

export const resolveCommit = async (ref: string): Promise<string> => {
  const hubDir = await getHubDir();
  const git = simpleGit(hubDir);

  try {
    const result = await git.revparse([ref]);
    return result.trim();
  } catch {
    throw new Error(`Commit not found: ${ref}`);
  }
};

export const checkoutCommit = async (sha: string): Promise<void> => {
  const hubDir = await getHubDir();
  const git = simpleGit(hubDir);

  try {
    await git.checkout(sha);
  } catch (error) {
    throw new Error(`Failed to checkout commit ${sha}: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const checkoutMain = async (): Promise<void> => {
  const hubDir = await getHubDir();
  const git = simpleGit(hubDir);
  const config = await loadConfig();
  const branch = config?.hubBranch || 'main';

  try {
    await git.checkout(branch);
  } catch {
    try {
      await git.checkout('master');
    } catch (error) {
      throw new Error(`Failed to checkout main/master branch: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};
