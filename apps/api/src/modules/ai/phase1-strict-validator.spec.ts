import { z } from 'zod';
import {
  phase1EnumSchema,
  phase1HeadlineSchema,
  phase1IdSchema,
  phase1ParagraphSchema,
  phase1StrictObject,
} from './phase1-strict-validator';

describe('phase1-strict-validator', () => {
  it('rejects unknown fields', () => {
    const schema = phase1StrictObject({ ok: z.boolean() });
    expect(() => schema.parse({ ok: true, extra: 'nope' })).toThrow();
  });

  it('enforces phase-1 id regex', () => {
    const schema = phase1IdSchema();
    expect(schema.parse('abcDEF12')).toBe('abcDEF12');
    expect(() => schema.parse('short')).toThrow();
    expect(() => schema.parse('bad space 123')).toThrow();
  });

  it('enforces headline max length', () => {
    const schema = phase1HeadlineSchema();
    expect(schema.parse('A good headline')).toBe('A good headline');
    expect(() => schema.parse('x'.repeat(301))).toThrow();
  });

  it('enforces paragraph max length', () => {
    const schema = phase1ParagraphSchema();
    expect(schema.parse('A good paragraph')).toBe('A good paragraph');
    expect(() => schema.parse('x'.repeat(1001))).toThrow();
  });

  it('enforces strict enums with no fallback', () => {
    const schema = phase1EnumSchema(['hero', 'features']);
    expect(schema.parse('hero')).toBe('hero');
    expect(() => schema.parse('cta')).toThrow();
  });
});
