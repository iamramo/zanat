export { input, confirm } from '@inquirer/prompts';

import { Command } from 'commander';
export const createProgram = (): Command => new Command();

export { Path } from './paths.js';

export { Config } from './services/config.js';
export { Fs } from './services/fs.js';
export { Time } from './services/date.js';
export { LockFile } from './services/lock-file.js';
export { Git } from './services/git.js';
export { Skills } from './services/skills.js';
export { Logger } from './services/logger.js';
export { Display } from './services/display.js';

export {
  updateSkill,
  updateAllSkills,
} from './domain/skills.js';

export { CommitShaSchema, type CommitSha } from './schemas/commit-sha.js';

export {
  validateSegment,
  parseSkillArg,
  formatFullSkillName,
  type ParsedNamespace,
} from './domain/namespace.js';
