import { describe, it, expect } from 'vitest';
import { sanitizeAlphanumeric, validateLength } from '../src/utils/validation';

describe('validation utils', () => {
  it('sanitizeAlphanumeric removes special characters', () => {
    expect(sanitizeAlphanumeric('abc!@#123')).toBe('abc123');
  });

  it('validateLength returns true when within limit', () => {
    expect(validateLength('hello', 10)).toBe(true);
  });

  it('validateLength returns false when exceeds limit', () => {
    expect(validateLength('hello world', 5)).toBe(false);
  });
});
