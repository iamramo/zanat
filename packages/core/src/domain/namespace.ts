const STARTS_WITH_LOWERCASE = /^[a-z]/;
const ALLOWED_CHARS_ONLY = /^[a-z0-9_-]+$/;
const MIN_LENGTH = 3;
const MAX_LENGTH = 64;

export interface ParsedNamespace {
  namespace: string[];
  skillName: string;
}

export const validateSegment = (segment: string): string | null => {
  if (segment.length < MIN_LENGTH) {
    return `Segment must be at least ${MIN_LENGTH} characters`;
  }
  if (segment.length > MAX_LENGTH) {
    return `Segment must be at most ${MAX_LENGTH} characters`;
  }
  if (!STARTS_WITH_LOWERCASE.test(segment)) {
    return 'Segment must start with a lowercase letter';
  }
  if (!ALLOWED_CHARS_ONLY.test(segment)) {
    return 'Segment can only contain lowercase letters, numbers, hyphens, and underscores';
  }
  return null;
};

export const parseSkillArg = (skillArg: string): ParsedNamespace | { error: string } => {
  const parts = skillArg.split('.');
  
  if (parts.length < 2) {
    return { 
      error: 'Invalid format. Use: namespace.skill-name or namespace.subnamespace.skill-name (e.g., mycompany.hello-world)' 
    };
  }

  const skillName = parts.pop()!;
  const namespace = parts;

  // Validate namespace segments
  for (const segment of namespace) {
    const error = validateSegment(segment);
    if (error) {
      return { error: `Invalid namespace segment: ${error}` };
    }
  }

  // Validate skill name
  const error = validateSegment(skillName);
  if (error) {
    return { error: `Invalid skill name: ${error}` };
  }

  return { namespace, skillName };
};

export const formatFullSkillName = (namespace: string[], skillName: string): string => {
  return [...namespace, skillName].join('.');
};
