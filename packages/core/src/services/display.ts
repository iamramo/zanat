const ELLIPSIS = '...';

export const Display = {
  getShortSha(sha: string, length = 7) {
    return sha.slice(0, length);
  },
  getDisplayVersion(version: string) {
    const isPinned = version !== 'latest';
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
};
