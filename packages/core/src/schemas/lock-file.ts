import { z } from 'zod';
import { GIT_COMMIT_SHA_REGEX } from './common.js';

export const SkillSchema = z.object({
  namespace: z.array(z.string()),
  skillName: z.string(),
  addedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  requestedRef: z.string().min(1),
  resolvedCommit: z.string().regex(GIT_COMMIT_SHA_REGEX),
});

export const FileSchema = z.object({
  version: z.literal(1),
  skills: z.record(SkillSchema),
});

export type ISkillLock = z.infer<typeof SkillSchema>;
export type ILockFile = z.infer<typeof FileSchema>;
