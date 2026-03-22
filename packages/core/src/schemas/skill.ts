import { z } from 'zod';

export const SkillFrontmatterSchema = z.object({
  id: z.string().min(1, 'id is required in frontmatter'),
  name: z.string().min(1, 'name is required in frontmatter'),
  description: z.string().min(1, 'description is required in frontmatter'),
  author: z.string().min(1, 'author is required in frontmatter'),
  version: z.string().min(1, 'version is required in frontmatter'),
  tags: z.array(z.string()).optional(),
});

export const SkillSchema = SkillFrontmatterSchema.extend({
  content: z.string(),
  namespace: z.array(z.string()),
  skill: z.string(),
  fullName: z.string(),
  path: z.string(),
});

export type ISkillFrontmatter = z.infer<typeof SkillFrontmatterSchema>;
export type ISkill = z.infer<typeof SkillSchema>;
