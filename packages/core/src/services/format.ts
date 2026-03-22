export const Format = {
  json(data: unknown): string {
    return JSON.stringify(data, null, 2);
  },
};