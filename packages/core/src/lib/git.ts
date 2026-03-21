import { simpleGit } from 'simple-git';
import { HUB_DIR } from '../utils/paths.js';
import fs from 'fs-extra';

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
