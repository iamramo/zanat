export interface SkillLock {
  version: number;
  skills: Record<string, LockedSkill>;
}

export interface LockedSkill {
  namespace: string[];
  skillName: string;
  hubPath: string;
  addedAt: string;
  updatedAt: string;
  version: string;
}
