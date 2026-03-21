import { z } from 'zod';
import { SourceNameSchema } from './source-name.js';
import { SkillNameSchema } from './skill-name.js';

export const SkillArgSchema = z
  .string()
  .transform((val) => {
    const parts = val.split('/');
    if (parts.length !== 2) {
      throw new Error('Invalid format. Use: source/skill-name (e.g., mycompany/hello-world)');
    }
    return { source: parts[0], skillName: parts[1] };
  })
  .pipe(
    z.object({
      source: SourceNameSchema,
      skillName: SkillNameSchema,
    })
  );

export type SkillArg = z.infer<typeof SkillArgSchema>;
