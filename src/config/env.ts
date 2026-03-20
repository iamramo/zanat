import { config } from 'dotenv';
import path from 'node:path';

config({ path: path.resolve(process.cwd(), '.env') });

export const ENV = {
  DEFAULT_HUB_URL: process.env.ZANAT_HUB_URL || 'https://github.com/iamramo/zanat-hub.git',
  DEFAULT_HUB_BRANCH: process.env.ZANAT_HUB_BRANCH || 'main',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DEBUG: process.env.DEBUG === 'true' || false,
} as const;
