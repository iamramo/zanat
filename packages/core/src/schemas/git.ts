import { z } from 'zod';
import {
  GIT_URL_REGEX,
  GIT_BRANCH_NAME_REGEX,
  GIT_TAG_REGEX,
  GIT_COMMIT_SHA_REGEX,
} from './common.js';

export const UrlSchema = z
  .string()
  .min(1, 'Git URL is required')
  .regex(GIT_URL_REGEX, 'Git URL must be a valid HTTPS or SSH URL');

export const BranchSchema = z
  .string()
  .min(1, 'Branch name is required')
  .regex(
    GIT_BRANCH_NAME_REGEX,
    'Branch name must start with alphanumeric and contain only letters, numbers, dots, hyphens, and underscores'
  );

export const TagSchema = z
  .string()
  .min(1, 'Tag is required')
  .regex(
    GIT_TAG_REGEX,
    'Tag must contain only letters, numbers, dots, hyphens, and underscores (optionally starting with v)'
  );

export const CommitShaSchema = z
  .string()
  .regex(
    GIT_COMMIT_SHA_REGEX,
    'Commit SHA must be 7-40 hexadecimal characters'
  );

export const RefSchema = z.union([
  BranchSchema,
  TagSchema,
  CommitShaSchema,
]);
