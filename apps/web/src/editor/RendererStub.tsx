type JsonRecord = Record<string, unknown>;

type RendererStubProps = {
  editorJson: unknown;
};

function asRecord(value: unknown): JsonRecord | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }
  return value as JsonRecord;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function getText(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function renderNode(node: unknown, index: number) {
  const nodeRecord = asRecord(node);
  if (!nodeRecord) {
    return (
      <div key={`node-${index}`} className="border border-dashed p-2 text-sm">
        [Invalid node]
      </div>
    );
  }

  const type = getText(nodeRecord.type, 'unknown');

  if (type === 'text') {
    const text = getText(nodeRecord.text, getText(nodeRecord.content, ''));
    return (
      <p key={`node-${index}`}>
        {text || '[Empty text]'}
      </p>
    );
  }

  if (type === 'button') {
    const label = getText(nodeRecord.label, getText(nodeRecord.text, 'Button'));
    return (
      <button key={`node-${index}`} type="button" disabled>
        {label}
      </button>
    );
  }

  if (type === 'image') {
    const src = getText(nodeRecord.src, getText(nodeRecord.url, ''));
    const alt = getText(nodeRecord.alt, 'Image');

    if (!src) {
      return (
        <div key={`node-${index}`} className="border border-dashed p-3 text-sm">
          [Missing image asset]
        </div>
      );
    }

    return <img key={`node-${index}`} src={src} alt={alt} className="max-w-full h-auto" />;
  }

  return (
    <div key={`node-${index}`} className="border border-dashed p-2 text-sm">
      [Unknown node type: {type}]
    </div>
  );
}

function renderBlock(block: unknown, index: number) {
  const blockRecord = asRecord(block);
  if (!blockRecord) {
    return (
      <div key={`block-${index}`} className="border p-3">
        [Invalid block]
      </div>
    );
  }

  const nodes = asArray(blockRecord.nodes);

  return (
    <div key={`block-${index}`} className="border p-3 space-y-2">
      {nodes.length === 0 ? <div className="text-sm">[Empty block]</div> : nodes.map(renderNode)}
    </div>
  );
}

function renderSection(section: unknown, index: number) {
  const sectionRecord = asRecord(section);
  if (!sectionRecord) {
    return (
      <section key={`section-${index}`} className="border p-4">
        [Invalid section]
      </section>
    );
  }

  const blocks = asArray(sectionRecord.blocks);

  return (
    <section key={`section-${index}`} className="border p-4 space-y-3">
      {blocks.length === 0 ? <div className="text-sm">[Empty section]</div> : blocks.map(renderBlock)}
    </section>
  );
}

export function RendererStub({ editorJson }: RendererStubProps) {
  const root = asRecord(editorJson);
  const sections = asArray(root?.sections);

  if (!root) {
    return <div className="border p-4 text-sm">[Invalid editor JSON root]</div>;
  }

  if (sections.length === 0) {
    return <div className="border p-4 text-sm">[No sections]</div>;
  }

  return <div className="space-y-4">{sections.map(renderSection)}</div>;
}
