import { SkillNameSchema } from '../schemas/skill-name.js';
import { SourceNameSchema } from '../schemas/source-name.js';
import { SegmentNameSchema } from '../schemas/segment-name.js';

export const Zod = {
  SkillNameSchema,
  SourceNameSchema,
  SegmentNameSchema,
} as const;
