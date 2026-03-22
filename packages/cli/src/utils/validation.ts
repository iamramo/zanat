import { Config, Fs, Logger } from '@iamramo/zanat-core';
import { SkillArgSchema, type SkillArg } from '../schemas/skill-arg.js';

export const validateSkillArg = (skillArg: string): SkillArg => {
  const result = SkillArgSchema.safeParse(skillArg);
  if (!result.success) {
    const errorMessage = result.error.issues[0]?.message ?? 'Invalid skill format';
    Logger.red(errorMessage, { prefix: '✗' });
    Logger.gray('Example: mycompany.hello-world or mycompany.team.hello-world');
    process.exit(1);
  }
  return result.data;
};

export const ensureHubExists = async (): Promise<void> => {
  const config = await Config.get();
  const hubExists = await Fs.exists(`${config.hubDir}/.git`);
  if (!hubExists) {
    Logger.red('Hub not found. Run `zanat init` first.', { prefix: '✗' });
    process.exit(1);
  }
};
