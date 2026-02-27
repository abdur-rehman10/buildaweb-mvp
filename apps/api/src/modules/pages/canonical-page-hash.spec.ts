import { canonicalPageHash, canonicalStringify } from './canonical-page-hash';

describe('canonical-page-hash', () => {
  it('canonicalStringify is key-order stable', () => {
    const left = canonicalStringify({ b: 2, a: { d: 4, c: 3 } });
    const right = canonicalStringify({ a: { c: 3, d: 4 }, b: 2 });
    expect(left).toBe(right);
  });

  it('hash is deterministic across runs', () => {
    const tokens = { colors: { primary: '#111111', secondary: '#FFFFFF' } };
    const page = {
      slug: 'home',
      sections: [{ id: 'sec_12345678', blocks: [{ id: 'blk_12345678' }] }],
    };

    const one = canonicalPageHash({ tokensJson: tokens, pageJson: page });
    const two = canonicalPageHash({ tokensJson: tokens, pageJson: page });
    expect(one).toBe(two);
  });

  it('hash changes when renderer version changes', () => {
    const tokens = { colors: { primary: '#111111' } };
    const page = { slug: 'home', sections: [] };

    const one = canonicalPageHash({
      tokensJson: tokens,
      pageJson: page,
      rendererVersion: 'v1',
    });
    const two = canonicalPageHash({
      tokensJson: tokens,
      pageJson: page,
      rendererVersion: 'v2',
    });

    expect(one).not.toBe(two);
  });
});
