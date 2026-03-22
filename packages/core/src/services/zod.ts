import { ConfigSchema } from '../schemas/config.js';
import { FullSkillNameSchema, SegmentSchema, SkillOpenStandardSchema, SkillSchema } from '../schemas/skill.js';
import { LockFileSchema, SkillLockSchema } from '../schemas/lock-file.js';

export const Zod = {
  ConfigSchema,
  FullSkillNameSchema,
  SegmentSchema,
  SkillOpenStandardSchema,
  SkillSchema,
  LockFileSchema,
  SkillLockSchema,
} as const;
