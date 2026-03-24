import { z } from 'zod';

export const PinOptionSchema = z.union([
  z.string().min(1, '--pin requires a ref value (branch, tag, or commit)'),
  z.undefined(),
]);

export type PinOption = z.infer<typeof PinOptionSchema>;
