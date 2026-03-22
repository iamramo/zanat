import { z } from 'zod';
import { GIT_URL_REGEX } from './common.js';

export const ConfigSchema = z.object({
  hubUrl: z
    .string()
    .min(1, 'hubUrl is required')
    .regex(GIT_URL_REGEX, 'hubUrl must be a valid git URL (https:// or git@)'),
  hubBranch: z.string().min(1, 'hubBranch is required'),
  hubDir: z.string().min(1, 'hubDir is required'),
  lastSync: z.string().datetime('lastSync must be a valid ISO 8601 timestamp'),
});

export type IConfig = z.infer<typeof ConfigSchema>;
