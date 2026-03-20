import simpleGit from 'simple-git';
import { HUB_DIR } from '../utils/paths';
import fs from 'fs-extra';

export async function cloneHub(hubUrl: string, branch: string): Promise<void> {
  await fs.ensureDir(HUB_DIR.replace('/hub', ''));
  const git = simpleGit();
  await git.clone(hubUrl, HUB_DIR, ['--branch', branch, '--single-branch']);
}

export async function pullHub(): Promise<void> {
  const git = simpleGit(HUB_DIR);
  await git.pull();
}

export async function isHubCloned(): Promise<boolean> {
  return fs.pathExists(`${HUB_DIR}/.git`);
}
