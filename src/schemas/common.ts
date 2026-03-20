// Shared validation logic and regex patterns
// Split by concern for clarity and reusability

/** Validates string starts with lowercase letter */
export const STARTS_WITH_LOWERCASE = /^[a-z]/;

/** Validates string contains only allowed characters */
export const ALLOWED_CHARS_ONLY = /^[a-z0-9_-]+$/;

/** Validates minimum length of 3 characters */
export const MIN_LENGTH = 3;

/** Validates maximum length of 64 characters */
export const MAX_LENGTH = 64;
