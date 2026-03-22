export interface ILockFile {
  version: number;
  skills: Record<string, ISkillLock>;
}

export interface ISkillLock {
  namespace: string[];
  skillName: string;
  hubPath: string;
  addedAt: string;
  updatedAt: string;
  version: string;
}
