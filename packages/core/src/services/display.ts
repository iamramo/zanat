import { LockFile } from './lock-file.js';
import { Config } from './config.js';

const ELLIPSIS = '...';

const ASCII_BANNER = `
███████╗ █████╗ ███╗   ██╗ █████╗ ████████╗
╚══███╔╝██╔══██╗████╗  ██║██╔══██╗╚══██╔══╝
  ███╔╝ ███████║██╔██╗ ██║███████║   ██║
 ███╔╝  ██╔══██║██║╚██╗██║██╔══██║   ██║
███████╗██║  ██║██║ ╚████║██║  ██║   ██║
╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝   ╚═╝
`;

export const Display = {
  getAsciiBanner(): string {
    return ASCII_BANNER;
  },
  getShortSha(sha: string, length = 7) {
    return sha.slice(0, length);
  },
  async getDisplayVersion(fullSkillName: string): Promise<string> {
    const skill = await LockFile.find(fullSkillName);
    if (!skill) {
      return 'unknown';
    }

    const config = await Config.get();
    const { requestedRef, resolvedCommit } = skill;
    const shortCommit = this.getShortSha(resolvedCommit);
    const refStatus = await LockFile.getRefStatus(skill);

    switch (refStatus) {
      case 'orphaned':
        return `${shortCommit} (orphaned from ${requestedRef})`;
      case 'broken':
        return `${shortCommit} (broken)`;
      case 'ok':
        return `${shortCommit} (${requestedRef})`;
      default:
        return ((_): never => {
          throw new Error(`Unexpected refStatus: ${_}`);
        })(refStatus);
    }
  },
  truncate(text: string, maxLength = 256): string {
    if (text.length <= maxLength) return text;

    const lastSpace = text.lastIndexOf(' ', maxLength - ELLIPSIS.length);
    if (lastSpace === -1) {
      return text.slice(0, maxLength - ELLIPSIS.length) + ELLIPSIS;
    }
    return text.slice(0, lastSpace) + ELLIPSIS;
  },
  timeAgo(timestamp?: string): string {
    if (!timestamp) return 'Never';

    const last = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - last.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    return last.toLocaleDateString();
  },
};
