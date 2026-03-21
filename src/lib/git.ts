import { simpleGit } from 'simple-git';
import { HUB_DIR } from '../utils/paths.js';
import fs from 'fs-extra';

export const cloneHub = async (hubUrl: string, branch: string): Promise<void> => {
  await fs.ensureDir(HUB_DIR.replace('/hub', ''));
  const git = simpleGit();
  await git.clone(hubUrl, HUB_DIR, ['--branch', branch, '--single-branch']);
};

export const pullHub = async (): Promise<void> => {
  const git = simpleGit(HUB_DIR);
  await git.pull();
};

export const isHubCloned = async (): Promise<boolean> => {
  return fs.pathExists(`${HUB_DIR}/.git`);
};
