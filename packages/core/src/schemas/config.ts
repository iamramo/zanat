import { z } from 'zod';
import { GIT_URL_REGEX } from './common.js';

export const Schema = z.object({
  hubUrl: z
    .string()
    .min(1, 'URL is required')
    .regex(GIT_URL_REGEX, 'URL must be a valid git URL (https:// or git@)'),
  hubBranch: z.string().min(1, 'Branch is required'),
  hubDir: z.string().min(1, 'Directory is required'),
  lastPull: z.string().datetime('Must be a valid ISO 8601 timestamp'),
});

export type IConfig = z.infer<typeof Schema>;
