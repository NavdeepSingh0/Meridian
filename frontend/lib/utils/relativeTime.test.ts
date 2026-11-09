import { describe, it, expect } from 'vitest';
import { relativeTime } from './relativeTime';

const NOW = new Date('2026-11-09T12:00:00Z').getTime();
const ago = (seconds: number) => new Date(NOW - seconds * 1000).toISOString();

describe('relativeTime', () => {
  it('says "just now" for very recent times', () => {
    expect(relativeTime(ago(5), NOW)).toBe('just now');
  });

  it('formats minutes, hours and days', () => {
    expect(relativeTime(ago(5 * 60), NOW)).toBe('5 minutes ago');
    expect(relativeTime(ago(2 * 3600), NOW)).toBe('2 hours ago');
    expect(relativeTime(ago(3 * 86400), NOW)).toBe('3 days ago');
  });

  it('uses natural wording for yesterday', () => {
    expect(relativeTime(ago(86400), NOW)).toBe('yesterday');
  });

  it('returns an empty string for an invalid date', () => {
    expect(relativeTime('not a date', NOW)).toBe('');
  });
});
