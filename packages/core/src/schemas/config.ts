import { z } from 'zod';

// Regex for git URLs: https://, http://, or git@ (SSH)
const GIT_URL_REGEX = /^(https?:\/\/|git@)[^\s]+$/;

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
