import { Schema as ConfigSchema } from '../schemas/config.js';
import { OpenStandardSchema, FullSchema } from '../schemas/skill.js';
import {
  FileSchema as LockFileSchema,
  SkillSchema as SkillLockSchema,
} from '../schemas/lock-file.js';
import { UrlSchema, BranchSchema, TagSchema, CommitShaSchema, RefSchema } from '../schemas/git.js';

export const Zod = {
  config: {
    ConfigSchema,
  },
  lockFile: {
    FileSchema: LockFileSchema,
    SkillSchema: SkillLockSchema,
  },
  skill: {
    OpenStandardSchema,
    FullSchema,
  },
  git: {
    UrlSchema,
    BranchSchema,
    TagSchema,
    CommitShaSchema,
    RefSchema,
  },
} as const;
