export const GIT_URL_REGEX = /^(https?:\/\/|git@)[^\s]+$/;

export const FULL_SKILL_NAME_REGEX = /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+$/;

export const GIT_BRANCH_NAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

export const GIT_REMOTE_BRANCH_REGEX = /^(origin\/)?[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

export const GIT_TAG_REGEX = /^v?[a-zA-Z0-9._-]+$/;

export const GIT_COMMIT_SHA_REGEX = /^[a-f0-9]{7,40}$/;
