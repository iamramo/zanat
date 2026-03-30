import { z } from 'zod';
import { FULL_SKILL_NAME_REGEX } from './common.js';

const FullNameSchema = z
  .string()
  .min(1, 'Skill name is required')
  .regex(
    FULL_SKILL_NAME_REGEX,
    'Skill name must be in format: namespace.skill-name (letters, numbers, hyphens, dots only)'
  );

export const OpenStandardSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    license: z.string().optional(),
    compatibility: z.string().optional(),
    'disable-model-invocation': z.boolean().optional(),
    'user-invocable': z.boolean().optional(),
    'argument-hint': z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .passthrough();

export const FullSchema = OpenStandardSchema.extend({
  content: z.string(),
  namespace: z.array(z.string()),
  skill: z.string(),
  fullName: FullNameSchema,
  path: z.string(),
});

export type ISkillFrontmatter = z.infer<typeof OpenStandardSchema>;
export type ISkill = z.infer<typeof FullSchema>;
