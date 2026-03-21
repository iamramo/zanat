import { z } from 'zod';
import { SegmentNameSchema } from './segment-name.js';

export const SkillArgSchema = z
  .string()
  .transform((val, ctx) => {
    const parts = val.split('.');
    if (parts.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Invalid format. Use: namespace.skill-name or namespace.subnamespace.skill-name (e.g., mycompany.hello-world or mycompany.team.hello-world)',
      });
      return z.NEVER;
    }
    const skillName = parts[parts.length - 1];
    const namespace = parts.slice(0, -1);
    return { namespace, skillName };
  })
  .pipe(
    z.object({
      namespace: z.array(SegmentNameSchema).min(1),
      skillName: SegmentNameSchema,
    })
  );

export type SkillArg = z.infer<typeof SkillArgSchema>;
