import { z } from 'zod';

export const SkillLockSchema = z.object({
  namespace: z.array(z.string()),
  skillName: z.string(),
  hubPath: z.string(),
  addedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.string(),
});

export const LockFileSchema = z.object({
  version: z.literal(1),
  skills: z.record(SkillLockSchema),
});

export type ISkillLock = z.infer<typeof SkillLockSchema>;
export type ILockFile = z.infer<typeof LockFileSchema>;
