import { LockFile } from '../index.js';

const ELLIPSIS = '...';

export const Display = {
  getShortSha(sha: string, length = 7) {
    return sha.slice(0, length);
  },
  getDisplayVersion(version: string) {
    const isPinned = LockFile.isPinned(version);
    return isPinned ? `${this.getShortSha(version)} (pinned)` : 'latest';
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
