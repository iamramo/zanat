import { SkillNameSchema } from '../schemas/skill-name.js';
import { SourceNameSchema } from '../schemas/source-name.js';
import { SegmentNameSchema } from '../schemas/segment-name.js';
import { ConfigSchema } from '../schemas/config.js';

export const Zod = {
  ConfigSchema,
  SkillNameSchema,
  SourceNameSchema,
  SegmentNameSchema,
} as const;
