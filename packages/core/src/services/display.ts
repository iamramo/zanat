import { LockFile } from './lock-file.js';

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
    if (!skill) return 'unknown';

    const shortCommit = this.getShortSha(skill.resolvedCommit);
    const pinned = await LockFile.isPinned(fullSkillName);

    if (pinned) {
      // If requestedRef is a commit SHA, the short SHA already conveys the version
      const isCommitSha = skill.requestedRef === skill.resolvedCommit;
      return isCommitSha ? `${shortCommit} (pinned)` : `${shortCommit} (${skill.requestedRef}, pinned)`;
    }
    return `${shortCommit} (${skill.requestedRef})`;
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
