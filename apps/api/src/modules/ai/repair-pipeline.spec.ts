import { readStrictnessMode, repairPayload } from './repair-pipeline';

describe('repair-pipeline', () => {
  it('fills missing ids deterministically', () => {
    const input = { type: 'node', href: 'https://example.com' };
    const first = repairPayload(input);
    const second = repairPayload(input);

    expect((first.repaired as { id: string }).id).toBeDefined();
    expect((first.repaired as { id: string }).id).toBe(
      (second.repaired as { id: string }).id,
    );
  });

  it('sorts arrays canonically', () => {
    const input = { id: 'abc12345', items: [{ id: 'b' }, { id: 'a' }] };
    const { repaired } = repairPayload(input);
    expect((repaired as { items: Array<{ id: string }> }).items[0].id).toBe(
      'a',
    );
  });

  it('defaults button variant', () => {
    const input = { id: 'btn12345', type: 'button' };
    const { repaired } = repairPayload(input);
    expect((repaired as { variant: string }).variant).toBe('primary');
  });

  it('drops unsafe rawHtml and normalizes href/tokenRef', () => {
    const input = {
      id: 'node12345',
      rawHtml: '<script>bad()</script>',
      href: 'javascript:alert(1)',
      tokenRef: 'color.primary',
    };

    const { repaired } = repairPayload(input);
    const asObj = repaired as Record<string, unknown>;

    expect(asObj.rawHtml).toBeUndefined();
    expect(asObj.href).toBe('#');
    expect(asObj.tokenRef).toBe('literal:color.primary');
  });

  it('reads strictness mode safely with strict default', () => {
    expect(readStrictnessMode(undefined)).toBe('strict');
    expect(readStrictnessMode('strict')).toBe('strict');
    expect(readStrictnessMode('repair')).toBe('repair');
    expect(readStrictnessMode('other')).toBe('strict');
  });
});
