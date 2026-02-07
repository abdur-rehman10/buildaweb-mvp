import { useRef, useState } from 'react';
import {
  deleteNodeById,
  deleteSection,
  duplicateSection,
  insertNodeInFirstBlock,
  moveSection,
  updateImageNodeAssetRefById,
} from './sectionHelpers';

type JsonRecord = Record<string, unknown>;

type RendererStubProps = {
  value: JsonRecord;
  onChange: (nextEditorJson: JsonRecord) => void;
  assetsById: Record<string, string>;
  onUploadImage: (nodeId: string, file: File) => Promise<{ assetId: string; publicUrl: string }>;
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

function getId(record: JsonRecord): string {
  const raw = record.id;
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'number') return String(raw);
  return '';
}

function getAssetRef(record: JsonRecord): string {
  const raw = record.asset_ref;
  if (typeof raw === 'string') return raw;
  if (typeof raw === 'number') return String(raw);
  return '';
}

function updateTextNodeContentById(editorJson: JsonRecord, nodeId: string, nextText: string): JsonRecord {
  const nextSections = asArray(editorJson.sections).map((section) => {
    const sectionRecord = asRecord(section);
    if (!sectionRecord) return section;

    const nextBlocks = asArray(sectionRecord.blocks).map((block) => {
      const blockRecord = asRecord(block);
      if (!blockRecord) return block;

      const nextNodes = asArray(blockRecord.nodes).map((node) => {
        const nodeRecord = asRecord(node);
        if (!nodeRecord) return node;

        if (getId(nodeRecord) !== nodeId || getText(nodeRecord.type) !== 'text') {
          return node;
        }

        const updatedNode: JsonRecord = { ...nodeRecord };

        if ('text' in nodeRecord || !('content' in nodeRecord)) {
          updatedNode.text = nextText;
        }
        if ('content' in nodeRecord) {
          updatedNode.content = nextText;
        }

        return updatedNode;
      });

      return { ...blockRecord, nodes: nextNodes };
    });

    return { ...sectionRecord, blocks: nextBlocks };
  });

  return { ...editorJson, sections: nextSections };
}

export function RendererStub({ value, onChange, assetsById, onUploadImage }: RendererStubProps) {
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState('');
  const [uploadingNodeId, setUploadingNodeId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  const beginEdit = (nodeId: string, initialText: string) => {
    if (!nodeId) return;
    setEditingNodeId(nodeId);
    setDraftText(initialText);
  };

  const commitEdit = (nodeId: string) => {
    const next = updateTextNodeContentById(value, nodeId, draftText);
    onChange(next);
    setEditingNodeId(null);
  };

  const triggerImagePicker = (nodeId: string) => {
    const input = fileInputsRef.current[nodeId];
    input?.click();
  };

  const handleImageFileChange = async (nodeId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !nodeId) return;

    setUploadingNodeId(nodeId);
    setUploadError(null);

    try {
      const uploaded = await onUploadImage(nodeId, file);
      const next = updateImageNodeAssetRefById(value, nodeId, uploaded.assetId);
      onChange(next);
    } catch {
      setUploadError('Image upload failed');
    } finally {
      setUploadingNodeId((current) => (current === nodeId ? null : current));
    }
  };

  const sections = asArray(value.sections);

  if (sections.length === 0) {
    return <div className="border p-4 text-sm">[No sections]</div>;
  }

  return (
    <div className="space-y-4">
      {sections.map((section, sectionIndex) => {
        const sectionRecord = asRecord(section);
        if (!sectionRecord) {
          return (
            <section key={`section-${sectionIndex}`} className="border p-4">
              [Invalid section]
            </section>
          );
        }

        const sectionId = getId(sectionRecord);
        const sectionType = getText(sectionRecord.type, `section-${sectionIndex + 1}`);
        const blocks = asArray(sectionRecord.blocks);

        return (
          <section key={`section-${sectionIndex}`} className="border p-4 space-y-3">
            <div className="flex items-center justify-between gap-3 border-b pb-2">
              <div className="text-sm font-medium">
                Section {sectionIndex + 1}: {sectionType}
                {!sectionId && <span className="text-xs"> [missing id]</span>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="border rounded px-2 py-1 text-xs"
                  disabled={!sectionId || sectionIndex === 0}
                  onClick={() => onChange(moveSection(value, sectionId, 'up'))}
                >
                  Up
                </button>
                <button
                  type="button"
                  className="border rounded px-2 py-1 text-xs"
                  disabled={!sectionId || sectionIndex === sections.length - 1}
                  onClick={() => onChange(moveSection(value, sectionId, 'down'))}
                >
                  Down
                </button>
                <button
                  type="button"
                  className="border rounded px-2 py-1 text-xs"
                  disabled={!sectionId}
                  onClick={() => onChange(duplicateSection(value, sectionId))}
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  className="border rounded px-2 py-1 text-xs"
                  disabled={!sectionId}
                  onClick={() => onChange(deleteSection(value, sectionId))}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="border rounded px-2 py-1 text-xs"
                  disabled={!sectionId || blocks.length === 0}
                  onClick={() => onChange(insertNodeInFirstBlock(value, sectionId, 'text'))}
                >
                  Add Text
                </button>
                <button
                  type="button"
                  className="border rounded px-2 py-1 text-xs"
                  disabled={!sectionId || blocks.length === 0}
                  onClick={() => onChange(insertNodeInFirstBlock(value, sectionId, 'button'))}
                >
                  Add Button
                </button>
                <button
                  type="button"
                  className="border rounded px-2 py-1 text-xs"
                  disabled={!sectionId || blocks.length === 0}
                  onClick={() => onChange(insertNodeInFirstBlock(value, sectionId, 'image'))}
                >
                  Add Image
                </button>
              </div>
            </div>

            {blocks.length === 0 ? (
              <div className="text-sm">[Empty section]</div>
            ) : (
              blocks.map((block, blockIndex) => {
                const blockRecord = asRecord(block);
                if (!blockRecord) {
                  return (
                    <div key={`block-${sectionIndex}-${blockIndex}`} className="border p-3">
                      [Invalid block]
                    </div>
                  );
                }

                const nodes = asArray(blockRecord.nodes);

                return (
                  <div key={`block-${sectionIndex}-${blockIndex}`} className="border p-3 space-y-2">
                    {nodes.length === 0 ? (
                      <div className="text-sm">[Empty block]</div>
                    ) : (
                      nodes.map((node, nodeIndex) => {
                        const nodeRecord = asRecord(node);
                        if (!nodeRecord) {
                          return (
                            <div
                              key={`node-${sectionIndex}-${blockIndex}-${nodeIndex}`}
                              className="border border-dashed p-2 text-sm"
                            >
                              [Invalid node]
                            </div>
                          );
                        }

                        const type = getText(nodeRecord.type, 'unknown');
                        const nodeId = getId(nodeRecord);
                        const canDelete = nodeId !== '';
                        const key = `node-${sectionIndex}-${blockIndex}-${nodeIndex}`;

                        const handleDelete = () => {
                          if (!canDelete) return;
                          onChange(deleteNodeById(value, nodeId));
                          if (editingNodeId === nodeId) {
                            setEditingNodeId(null);
                          }
                        };

                        let content: React.ReactNode;

                        if (type === 'text') {
                          const text = getText(nodeRecord.text, getText(nodeRecord.content, ''));
                          const isEditing = nodeId !== '' && editingNodeId === nodeId;

                          if (isEditing) {
                            content = (
                              <textarea
                                value={draftText}
                                onChange={(e) => setDraftText(e.target.value)}
                                onBlur={() => commitEdit(nodeId)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    e.currentTarget.blur();
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingNodeId(null);
                                  }
                                }}
                                className="w-full min-h-[60px] p-2 border rounded-md"
                                autoFocus
                              />
                            );
                          } else {
                            content = (
                              <div>
                                <p onClick={() => beginEdit(nodeId, text)} className={nodeId ? 'cursor-text' : ''}>
                                  {text || '[Empty text]'}
                                </p>
                                {!nodeId && <div className="text-xs">[Text node missing id - read only]</div>}
                              </div>
                            );
                          }
                        } else if (type === 'button') {
                          const label = getText(nodeRecord.label, getText(nodeRecord.text, 'Button'));
                          content = (
                            <button type="button" disabled>
                              {label}
                            </button>
                          );
                        } else if (type === 'image') {
                          const assetRef = getAssetRef(nodeRecord);
                          const src = assetRef ? getText(assetsById[assetRef], '') : '';
                          const alt = getText(nodeRecord.alt, 'Image');

                          if (!src) {
                            content = (
                              <div className="space-y-2">
                                <div className="border border-dashed p-3 text-sm">
                                  [Missing image asset]
                                </div>
                                {assetRef && (
                                  <div className="text-xs text-muted-foreground">
                                    asset_ref: {assetRef}
                                  </div>
                                )}
                                {nodeId && (
                                  <>
                                    <input
                                      ref={(el) => {
                                        fileInputsRef.current[nodeId] = el;
                                      }}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => void handleImageFileChange(nodeId, e)}
                                    />
                                    <button
                                      type="button"
                                      className="border rounded px-2 py-1 text-xs"
                                      onClick={() => triggerImagePicker(nodeId)}
                                      disabled={uploadingNodeId === nodeId}
                                    >
                                      {uploadingNodeId === nodeId ? 'Uploading...' : 'Upload/Replace'}
                                    </button>
                                  </>
                                )}
                              </div>
                            );
                          } else {
                            content = (
                              <div className="space-y-2">
                                <img src={src} alt={alt} className="max-w-full h-auto" />
                                {assetRef && (
                                  <div className="text-xs text-muted-foreground">
                                    asset_ref: {assetRef}
                                  </div>
                                )}
                                {nodeId && (
                                  <>
                                    <input
                                      ref={(el) => {
                                        fileInputsRef.current[nodeId] = el;
                                      }}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => void handleImageFileChange(nodeId, e)}
                                    />
                                    <button
                                      type="button"
                                      className="border rounded px-2 py-1 text-xs"
                                      onClick={() => triggerImagePicker(nodeId)}
                                      disabled={uploadingNodeId === nodeId}
                                    >
                                      {uploadingNodeId === nodeId ? 'Uploading...' : 'Upload/Replace'}
                                    </button>
                                  </>
                                )}
                              </div>
                            );
                          }
                        } else {
                          content = (
                            <div className="border border-dashed p-2 text-sm">
                              [Unknown node type: {type}]
                            </div>
                          );
                        }

                        return (
                          <div key={key} className="border rounded p-2 space-y-2">
                            <div className="flex justify-end">
                              <button
                                type="button"
                                className="border rounded px-2 py-1 text-xs"
                                disabled={!canDelete}
                                onClick={handleDelete}
                              >
                                Delete
                              </button>
                            </div>
                            {content}
                            {!canDelete && <div className="text-xs">[Node missing id - cannot delete]</div>}
                          </div>
                        );
                      })
                    )}
                  </div>
                );
              })
            )}
          </section>
        );
      })}
      {uploadError && <div className="text-xs" role="alert">{uploadError}</div>}
    </div>
  );
}
