import { Format } from '@iamramo/zanat-core';

export function text(content: string) {
  return { content: [{ type: 'text' as const, text: content }] };
}

export function json(data: unknown) {
  return text(Format.json(data));
}

export function error(message: string) {
  return { content: [{ type: 'text' as const, text: message }], isError: true as const };
}
