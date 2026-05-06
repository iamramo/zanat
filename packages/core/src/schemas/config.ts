import { z } from 'zod';
import { GIT_URL_REGEX } from './common.js';

export const HubSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .regex(GIT_URL_REGEX, 'URL must be a valid git URL (https:// or git@)'),
  branch: z.string().min(1, 'Branch is required'),
  dir: z.string().min(1, 'Directory is required'),
  lastPull: z.string().datetime('Must be a valid ISO 8601 timestamp'),
});

export const Schema = z.object({
  version: z.literal(1),
  activeHub: z.string().min(1),
  hubs: z.record(z.string().min(1), HubSchema),
});

export type IHubConfig = z.infer<typeof HubSchema>;
export type IConfig = z.infer<typeof Schema>;
