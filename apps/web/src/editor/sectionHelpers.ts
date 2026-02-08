type JsonRecord = Record<string, unknown>;

export type SectionPresetType = 'hero' | 'features' | 'cta' | 'pricing' | 'contact' | 'footer';
export type NodeInsertType = 'text' | 'button' | 'image';

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

export function createStableId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function textNode(text: string): JsonRecord {
  return { id: createStableId(), type: 'text', text };
}

function buttonNode(label: string): JsonRecord {
  return { id: createStableId(), type: 'button', label };
}

function imageNode(url?: string): JsonRecord {
  return {
    id: createStableId(),
    type: 'image',
    src: url ?? '',
    alt: 'Image',
  };
}

function block(nodes: JsonRecord[]): JsonRecord {
  return { id: createStableId(), nodes };
}

function createPresetSection(presetType: SectionPresetType): JsonRecord {
  switch (presetType) {
    case 'hero':
      return {
        id: createStableId(),
        type: 'hero',
        blocks: [block([textNode('Hero headline'), buttonNode('Get started')])],
      };
    case 'features':
      return {
        id: createStableId(),
        type: 'features',
        blocks: [block([textNode('Feature list')])],
      };
    case 'cta':
      return {
        id: createStableId(),
        type: 'cta',
        blocks: [block([textNode('Call to action'), buttonNode('Contact us')])],
      };
    case 'pricing':
      return {
        id: createStableId(),
        type: 'pricing',
        blocks: [block([textNode('Pricing plans')])],
      };
    case 'contact':
      return {
        id: createStableId(),
        type: 'contact',
        blocks: [block([textNode('Contact us'), imageNode()])],
      };
    case 'footer':
      return {
        id: createStableId(),
        type: 'footer',
        blocks: [block([textNode('Footer text')])],
      };
    default:
      return {
        id: createStableId(),
        type: 'hero',
        blocks: [block([textNode('Section')])],
      };
  }
}

function cloneNodeWithNewId(node: unknown): unknown {
  const nodeRecord = asRecord(node);
  if (!nodeRecord) return node;
  return { ...nodeRecord, id: createStableId() };
}

function cloneBlockWithNewIds(blockValue: unknown): unknown {
  const blockRecord = asRecord(blockValue);
  if (!blockRecord) return blockValue;

  const nodes = asArray(blockRecord.nodes).map((node) => cloneNodeWithNewId(node));
  return {
    ...blockRecord,
    id: createStableId(),
    nodes,
  };
}

function cloneSectionWithNewIds(sectionValue: unknown): unknown {
  const sectionRecord = asRecord(sectionValue);
  if (!sectionRecord) return sectionValue;

  const blocks = asArray(sectionRecord.blocks).map((blockValue) => cloneBlockWithNewIds(blockValue));

  return {
    ...sectionRecord,
    id: createStableId(),
    blocks,
  };
}

function createDefaultNode(nodeType: NodeInsertType): JsonRecord {
  if (nodeType === 'text') {
    return {
      id: createStableId(),
      type: 'text',
      content: 'New text',
    };
  }

  if (nodeType === 'button') {
    return {
      id: createStableId(),
      type: 'button',
      label: 'Click me',
      href: '#',
    };
  }

  return {
    id: createStableId(),
    type: 'image',
    asset_ref: null,
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

export function insertNodeInFirstBlock(
  editorJson: JsonRecord,
  sectionId: string,
  nodeType: NodeInsertType,
): JsonRecord {
  const sections = asArray(editorJson.sections);

  const nextSections = sections.map((section) => {
    const sectionRecord = asRecord(section);
    if (!sectionRecord || getId(sectionRecord) !== sectionId) {
      return section;
    }

    const blocks = asArray(sectionRecord.blocks);
    if (blocks.length === 0) {
      return section;
    }

    const firstBlockRecord = asRecord(blocks[0]);
    if (!firstBlockRecord) {
      return section;
    }

    const nodes = asArray(firstBlockRecord.nodes);
    const nextFirstBlock = {
      ...firstBlockRecord,
      nodes: [...nodes, createDefaultNode(nodeType)],
    };

    return {
      ...sectionRecord,
      blocks: [nextFirstBlock, ...blocks.slice(1)],
    };
  });

  return {
    ...editorJson,
    sections: nextSections,
  };
}

export function deleteNodeById(editorJson: JsonRecord, nodeId: string): JsonRecord {
  const sections = asArray(editorJson.sections);

  const nextSections = sections.map((section) => {
    const sectionRecord = asRecord(section);
    if (!sectionRecord) {
      return section;
    }

    const blocks = asArray(sectionRecord.blocks);
    const nextBlocks = blocks.map((block) => {
      const blockRecord = asRecord(block);
      if (!blockRecord) {
        return block;
      }

      const nodes = asArray(blockRecord.nodes);
      const nextNodes = nodes.filter((node) => {
        const nodeRecord = asRecord(node);
        if (!nodeRecord) {
          return true;
        }
        return getId(nodeRecord) !== nodeId;
      });

      return {
        ...blockRecord,
        nodes: nextNodes,
      };
    });

    return {
      ...sectionRecord,
      blocks: nextBlocks,
    };
  });

  return {
    ...editorJson,
    sections: nextSections,
  };
}

export function updateImageNodeAssetRefById(
  editorJson: JsonRecord,
  nodeId: string,
  assetId: string,
): JsonRecord {
  const sections = asArray(editorJson.sections);

  const nextSections = sections.map((section) => {
    const sectionRecord = asRecord(section);
    if (!sectionRecord) {
      return section;
    }

    const blocks = asArray(sectionRecord.blocks);
    const nextBlocks = blocks.map((block) => {
      const blockRecord = asRecord(block);
      if (!blockRecord) {
        return block;
      }

      const nodes = asArray(blockRecord.nodes);
      const nextNodes = nodes.map((node) => {
        const nodeRecord = asRecord(node);
        if (!nodeRecord) {
          return node;
        }

        const type = typeof nodeRecord.type === 'string' ? nodeRecord.type : '';
        if (getId(nodeRecord) !== nodeId || type !== 'image') {
          return node;
        }

        return {
          ...nodeRecord,
          asset_ref: assetId,
        };
      });

      return {
        ...blockRecord,
        nodes: nextNodes,
      };
    });

    return {
      ...sectionRecord,
      blocks: nextBlocks,
    };
  });

  return {
    ...editorJson,
    sections: nextSections,
  };
}

export function updateImageNodeAssetById(
  editorJson: JsonRecord,
  nodeId: string,
  asset: { assetId: string; publicUrl: string },
): JsonRecord {
  const sections = asArray(editorJson.sections);

  const nextSections = sections.map((section) => {
    const sectionRecord = asRecord(section);
    if (!sectionRecord) {
      return section;
    }

    const blocks = asArray(sectionRecord.blocks);
    const nextBlocks = blocks.map((block) => {
      const blockRecord = asRecord(block);
      if (!blockRecord) {
        return block;
      }

      const nodes = asArray(blockRecord.nodes);
      const nextNodes = nodes.map((node) => {
        const nodeRecord = asRecord(node);
        if (!nodeRecord) {
          return node;
        }

        const type = typeof nodeRecord.type === 'string' ? nodeRecord.type : '';
        if (getId(nodeRecord) !== nodeId || type !== 'image') {
          return node;
        }

        return {
          ...nodeRecord,
          asset_ref: asset.assetId,
          src: asset.publicUrl,
        };
      });

      return {
        ...blockRecord,
        nodes: nextNodes,
      };
    });

    return {
      ...sectionRecord,
      blocks: nextBlocks,
    };
  });

  return {
    ...editorJson,
    sections: nextSections,
  };
}

export function updateButtonNodeHrefById(
  editorJson: JsonRecord,
  nodeId: string,
  nextHref: string,
): JsonRecord {
  const sections = asArray(editorJson.sections);

  const nextSections = sections.map((section) => {
    const sectionRecord = asRecord(section);
    if (!sectionRecord) {
      return section;
    }

    const blocks = asArray(sectionRecord.blocks);
    const nextBlocks = blocks.map((block) => {
      const blockRecord = asRecord(block);
      if (!blockRecord) {
        return block;
      }

      const nodes = asArray(blockRecord.nodes);
      const nextNodes = nodes.map((node) => {
        const nodeRecord = asRecord(node);
        if (!nodeRecord) {
          return node;
        }

        const type = typeof nodeRecord.type === 'string' ? nodeRecord.type : '';
        if (getId(nodeRecord) !== nodeId || type !== 'button') {
          return node;
        }

        return {
          ...nodeRecord,
          href: nextHref,
        };
      });

      return {
        ...blockRecord,
        nodes: nextNodes,
      };
    });

    return {
      ...sectionRecord,
      blocks: nextBlocks,
    };
  });

  return {
    ...editorJson,
    sections: nextSections,
  };
}

// Backward-compatible alias; prefer updateButtonNodeHrefById.
export function updateButtonHrefById(
  editorJson: JsonRecord,
  nodeId: string,
  nextHref: string,
): JsonRecord {
  return updateButtonNodeHrefById(editorJson, nodeId, nextHref);
}
