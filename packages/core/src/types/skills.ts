export interface ISkillFrontmatter {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  tags?: string[];
}

export interface ISkill extends ISkillFrontmatter {
  content: string;
  namespace: string[];
  skill: string;
  fullName: string;
  path: string;
}
