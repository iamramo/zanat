import { z } from 'zod';
import { SourceNameSchema } from './source-name.js';
import { SkillNameSchema } from './skill-name.js';

export const SkillArgSchema = z.string().refine(
  (val) => {
    const parts = val.split('/');
    if (parts.length !== 2) return false;

    const [source, skill] = parts;
    return SourceNameSchema.safeParse(source).success && SkillNameSchema.safeParse(skill).success;
  },
  {
    message: 'Invalid format. Use: source/skill-name (e.g., mycompany/hello-world)',
  }
);

export type SkillArg = z.infer<typeof SkillArgSchema>;
