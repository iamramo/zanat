import { ConfigSchema } from '../schemas/config.js';
import { SkillFrontmatterSchema, SkillSchema } from '../schemas/skill.js';
import { LockFileSchema, SkillLockSchema } from '../schemas/lock-file.js';

export const Zod = {
  ConfigSchema,
  SkillFrontmatterSchema,
  SkillSchema,
  LockFileSchema,
  SkillLockSchema,
} as const;
