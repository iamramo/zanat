export interface SkillFrontmatter {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  tags?: string[];
}

export interface Skill extends SkillFrontmatter {
  content: string;
  namespace: string[];
  skill: string;
  fullName: string;
  path: string;
}
