import { z } from 'zod';
import { GIT_URL_REGEX } from './common.js';

export const UrlSchema = z
  .string()
  .min(1, 'Git URL is required')
  .regex(GIT_URL_REGEX, 'Git URL must be a valid HTTPS or SSH URL');

export const BranchSchema = z
  .string()
  .min(1, 'Branch name is required')
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/,
    'Branch name must start with alphanumeric and contain only letters, numbers, dots, hyphens, and underscores'
  );

export const TagSchema = z
  .string()
  .min(1, 'Tag is required')
  .regex(
    /^v?[a-zA-Z0-9._-]+$/,
    'Tag must contain only letters, numbers, dots, hyphens, and underscores (optionally starting with v)'
  );

export const CommitShaSchema = z
  .string()
  .regex(
    /^[a-f0-9]{7,40}$/,
    'Commit SHA must be 7-40 hexadecimal characters'
  );

export const RefSchema = z.union([
  BranchSchema,
  TagSchema,
  CommitShaSchema,
]);
