import { z } from 'zod';

export const CommitShaSchema = z
  .string()
  .regex(/^[a-f0-9]{7,40}$/i, 'Invalid commit SHA format. Must be 7-40 hexadecimal characters.');

export type CommitSha = z.infer<typeof CommitShaSchema>;
