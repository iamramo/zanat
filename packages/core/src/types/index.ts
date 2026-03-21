export interface Skill {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  tags?: string[];
  content: string;
  namespace: string[];
  skillName: string;
  path: string;
}

export interface SkillFrontmatter {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  tags?: string[];
}

export interface ZanatConfig {
  hubUrl: string;
  hubBranch: string;
  lastSync?: string;
}

export interface SkillLock {
  version: number;
  skills: Record<string, LockedSkill>;
}

export interface LockedSkill {
  namespace: string[];
  skillName: string;
  hubPath: string;
  installedAt: string;
  updatedAt: string;
  version: string;
}
