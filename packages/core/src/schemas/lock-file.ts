import { z } from 'zod';

export const SkillSchema = z.object({
  namespace: z.array(z.string()),
  skillName: z.string(),
  hubPath: z.string(),
  addedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  version: z.string(),
});

export const FileSchema = z.object({
  version: z.literal(1),
  skills: z.record(SkillSchema),
});

export type ISkillLock = z.infer<typeof SkillSchema>;
export type ILockFile = z.infer<typeof FileSchema>;
