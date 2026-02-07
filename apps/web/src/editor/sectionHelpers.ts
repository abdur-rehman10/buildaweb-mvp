type JsonRecord = Record<string, unknown>;

export type SectionPresetType = 'hero' | 'features' | 'cta' | 'pricing' | 'contact' | 'footer';

function asRecord(value: unknown): JsonRecord | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  return value as JsonRecord;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function getId(record: JsonRecord): string {
  const raw = record.id;
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'number') return String(raw);
  return '';
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function textNode(text: string): JsonRecord {
  return { id: createId(), type: 'text', text };
}

function buttonNode(label: string): JsonRecord {
  return { id: createId(), type: 'button', label };
}

function imageNode(url?: string): JsonRecord {
  return {
    id: createId(),
    type: 'image',
    src: url ?? '',
    alt: 'Image',
  };
}

function block(nodes: JsonRecord[]): JsonRecord {
  return { id: createId(), nodes };
}

function createPresetSection(presetType: SectionPresetType): JsonRecord {
  switch (presetType) {
    case 'hero':
      return {
        id: createId(),
        type: 'hero',
        blocks: [block([textNode('Hero headline'), buttonNode('Get started')])],
      };
    case 'features':
      return {
        id: createId(),
        type: 'features',
        blocks: [block([textNode('Feature list')])],
      };
    case 'cta':
      return {
        id: createId(),
        type: 'cta',
        blocks: [block([textNode('Call to action'), buttonNode('Contact us')])],
      };
    case 'pricing':
      return {
        id: createId(),
        type: 'pricing',
        blocks: [block([textNode('Pricing plans')])],
      };
    case 'contact':
      return {
        id: createId(),
        type: 'contact',
        blocks: [block([textNode('Contact us'), imageNode()])],
      };
    case 'footer':
      return {
        id: createId(),
        type: 'footer',
        blocks: [block([textNode('Footer text')])],
      };
    default:
      return {
        id: createId(),
        type: 'hero',
        blocks: [block([textNode('Section')])],
      };
  }
}

function cloneNodeWithNewId(node: unknown): unknown {
  const nodeRecord = asRecord(node);
  if (!nodeRecord) return node;
  return { ...nodeRecord, id: createId() };
}

function cloneBlockWithNewIds(blockValue: unknown): unknown {
  const blockRecord = asRecord(blockValue);
  if (!blockRecord) return blockValue;

  const nodes = asArray(blockRecord.nodes).map((node) => cloneNodeWithNewId(node));
  return {
    ...blockRecord,
    id: createId(),
    nodes,
  };
}

function cloneSectionWithNewIds(sectionValue: unknown): unknown {
  const sectionRecord = asRecord(sectionValue);
  if (!sectionRecord) return sectionValue;

  const blocks = asArray(sectionRecord.blocks).map((blockValue) => cloneBlockWithNewIds(blockValue));

  return {
    ...sectionRecord,
    id: createId(),
    blocks,
  };
}

export function addSection(editorJson: JsonRecord, presetType: SectionPresetType): JsonRecord {
  const sections = asArray(editorJson.sections);

  return {
    ...editorJson,
    sections: [...sections, createPresetSection(presetType)],
  };
}

export function duplicateSection(editorJson: JsonRecord, sectionId: string): JsonRecord {
  const sections = asArray(editorJson.sections);
  const sourceIndex = sections.findIndex((section) => {
    const record = asRecord(section);
    return !!record && getId(record) === sectionId;
  });

  if (sourceIndex < 0) return editorJson;

  const duplicate = cloneSectionWithNewIds(sections[sourceIndex]);
  const nextSections = [...sections];
  nextSections.splice(sourceIndex + 1, 0, duplicate);

  return {
    ...editorJson,
    sections: nextSections,
  };
}

export function deleteSection(editorJson: JsonRecord, sectionId: string): JsonRecord {
  const sections = asArray(editorJson.sections);
  const nextSections = sections.filter((section) => {
    const record = asRecord(section);
    return !record || getId(record) !== sectionId;
  });

  return {
    ...editorJson,
    sections: nextSections,
  };
}

export function moveSection(editorJson: JsonRecord, sectionId: string, direction: 'up' | 'down'): JsonRecord {
  const sections = asArray(editorJson.sections);
  const index = sections.findIndex((section) => {
    const record = asRecord(section);
    return !!record && getId(record) === sectionId;
  });

  if (index < 0) return editorJson;

  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= sections.length) return editorJson;

  const nextSections = [...sections];
  const [item] = nextSections.splice(index, 1);
  nextSections.splice(targetIndex, 0, item);

  return {
    ...editorJson,
    sections: nextSections,
  };
}
