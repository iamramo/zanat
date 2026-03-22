export const Display = {
  getShortSha(sha: string, length = 7) {
    return sha.slice(0, length);
  },
  getDisplayVersion(version: string) {
    const isPinned = version !== 'latest';
    return isPinned ? `${this.getShortSha(version)} (pinned)` : 'latest';
  },
};
