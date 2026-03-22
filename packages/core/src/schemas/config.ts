import { z } from 'zod';

export const ConfigSchema = z.object({
  hubUrl: z.string().min(1, 'hubUrl is required'),
  hubBranch: z.string().min(1, 'hubBranch is required'),
  hubDir: z.string().min(1, 'hubDir is required'),
  lastSync: z.string(),
});

export type IConfig = z.infer<typeof ConfigSchema>;
