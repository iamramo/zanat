import { z } from 'zod';
import { STARTS_WITH_LOWERCASE, ALLOWED_CHARS_ONLY, MIN_LENGTH, MAX_LENGTH } from './common.js';

export const SegmentNameSchema = z
  .string()
  .min(MIN_LENGTH, `Segment must be at least ${MIN_LENGTH} characters`)
  .max(MAX_LENGTH, `Segment must be at most ${MAX_LENGTH} characters`)
  .regex(STARTS_WITH_LOWERCASE, 'Segment must start with a lowercase letter')
  .regex(
    ALLOWED_CHARS_ONLY,
    'Segment can only contain lowercase letters, numbers, hyphens, and underscores'
  );
