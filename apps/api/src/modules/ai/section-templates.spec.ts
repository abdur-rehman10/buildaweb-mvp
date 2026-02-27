import {
  buildCanonicalSectionTemplates,
  canonicalTemplateTypeList,
  resolveTemplatePlaceholders,
  sectionSchema,
} from './section-templates';

describe('section-templates', () => {
  it('builds canonical templates that validate against section schema.v1', () => {
    const sections = buildCanonicalSectionTemplates({
      'business.name': 'Acme',
      'business.industry': 'consulting',
      'image.heroQuery': 'consulting team office',
      'pricing.starter': '$19/mo',
      'pricing.growth': '$49/mo',
    });

    expect(sections).toHaveLength(4);
    sections.forEach((section) => {
      expect(() => sectionSchema.parse(section)).not.toThrow();
    });
    expect(canonicalTemplateTypeList()).toEqual([
      'hero',
      'features',
      'pricing',
      'footer',
    ]);
  });

  it('resolves placeholders with deterministic literal fallback', () => {
    expect(resolveTemplatePlaceholders('Welcome {{business.name}}', {})).toBe(
      'Welcome literal:business.name',
    );

    expect(
      resolveTemplatePlaceholders('Welcome {{business.name}}', {
        'business.name': 'Acme',
      }),
    ).toBe('Welcome Acme');
  });

  it('buildCanonicalSectionTemplates falls back missing token placeholders to literal:*', () => {
    const sections = buildCanonicalSectionTemplates({
      'business.name': 'Acme',
      'business.industry': 'consulting',
    });

    const pricing = sections.find((section) => section.type === 'pricing');
    expect(pricing).toBeDefined();
    if (pricing?.type === 'pricing') {
      expect(pricing.plans[0].price).toBe('literal:pricing.starter');
      expect(pricing.plans[1].price).toBe('literal:pricing.growth');
    }
  });
});
