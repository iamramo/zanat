import { z } from 'zod';
import { STARTS_WITH_LOWERCASE, ALLOWED_CHARS_ONLY, MIN_LENGTH, MAX_LENGTH } from './common.js';

export const SkillNameSchema = z
  .string()
  .min(MIN_LENGTH, `Skill name must be at least ${MIN_LENGTH} characters`)
  .max(MAX_LENGTH, `Skill name must be ${MAX_LENGTH} characters or less`)
  .regex(STARTS_WITH_LOWERCASE, 'Skill name must start with a lowercase letter')
  .regex(
    ALLOWED_CHARS_ONLY,
    'Skill name can only contain lowercase letters, numbers, hyphens, and underscores'
  );

export type SkillName = z.infer<typeof SkillNameSchema>;
