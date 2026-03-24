import { input, confirm } from '@inquirer/prompts';
import type z from 'zod';

export const Prompt = {
  input,
  confirm,
  validate: (schema: z.ZodTypeAny, customErrorMessage?: string) => {
    return (value: string): true | string => {
      const result = schema.safeParse(value);
      return result.success
        ? true
        : (customErrorMessage ?? result.error.errors[0]?.message ?? 'Invalid value');
    };
  },
};
