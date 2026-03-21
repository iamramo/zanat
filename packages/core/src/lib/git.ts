import { simpleGit } from 'simple-git';
import { HUB_DIR } from '../utils/paths.js';
import fs from 'fs-extra';
import { loadConfig } from './config.js';

export interface HubStatus {
  initialized: boolean;
  behind: number;
  remoteUrl?: string;
  branch?: string;
}

export const cloneHub = async (hubUrl: string, branch: string): Promise<string> => {
  await fs.ensureDir(HUB_DIR.replace('/hub', ''));
  const git = simpleGit();

  try {
    await git.clone(hubUrl, HUB_DIR, ['--branch', branch, '--single-branch']);
    return branch;
  } catch (error) {
    if (branch === 'main') {
      console.log(`Branch 'main' not found, trying 'master'...`);
      try {
        await git.clone(hubUrl, HUB_DIR, ['--branch', 'master', '--single-branch']);
        return 'master';
      } catch {
        throw new Error(`Failed to clone repository. Neither 'main' nor 'master' branch found.`);
      }
    }
    throw error;
  }
};

export const pullHub = async (): Promise<void> => {
  const git = simpleGit(HUB_DIR);
  await git.pull();
};

export const isHubCloned = async (): Promise<boolean> => {
  return fs.pathExists(`${HUB_DIR}/.git`);
};

export const getHubStatus = async (): Promise<HubStatus> => {
  const initialized = await isHubCloned();

  if (!initialized) {
    return { initialized: false, behind: 0 };
  }

  const config = await loadConfig();
  const git = simpleGit(HUB_DIR);

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
