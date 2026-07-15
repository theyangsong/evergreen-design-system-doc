import { AffineSchemas, PageEditorBlockSpecs } from '@blocksuite/blocks';
import { PageEditor } from '@blocksuite/presets';
import { effects as registerPresetEffects } from '@blocksuite/presets/effects';
import {
  DocCollection,
  Job,
  Schema,
  Text,
  type Doc,
  type DocSnapshot,
} from '@blocksuite/store';
import { uniqueSlug } from '@/utils/slugify';

const STORAGE_PREFIX = 'eds-blocksuite-doc:';

let collection: DocCollection | null = null;
let effectsRegistered = false;

export function ensureBlockSuiteEffects() {
  if (effectsRegistered) {
    return;
  }

  registerPresetEffects();
  effectsRegistered = true;
}

export function getCollection(): DocCollection {
  if (!collection) {
    const schema = new Schema().register(AffineSchemas);
    collection = new DocCollection({ schema });
    collection.meta.initialize();
  }

  return collection;
}

function pagePathToDocId(pagePath: string) {
  return pagePath.replace(/\//g, '-').replace(/^-/, '') || 'home';
}

function storageKey(pagePath: string) {
  return STORAGE_PREFIX + pagePath;
}

function waitForDocReady(doc: Doc) {
  if (doc.ready) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    doc.slots.ready.once(() => resolve());
  });
}

function addParagraph(doc: Doc, parentId: string, type: string, content: string) {
  const blockId = doc.addBlock('affine:paragraph', {}, parentId);
  const block = doc.getBlockById(blockId);

  if (!block) {
    return;
  }

  doc.updateBlock(block, {
    type,
    text: new Text(content),
  });
}

function seedDefaultDoc(doc: Doc) {
  doc.load();

  if (!doc.isEmpty) {
    return;
  }

  const pageBlockId = doc.addBlock('affine:page', {});
  doc.addBlock('affine:surface', {}, pageBlockId);
  const noteId = doc.addBlock('affine:note', {}, pageBlockId);

  addParagraph(doc, noteId, 'h2', '标题样式');
  addParagraph(doc, noteId, 'h3', '其他标题');
  addParagraph(doc, noteId, 'text', '正文样式');
}

function createFreshDoc(pagePath: string) {
  const coll = getCollection();
  const docId = pagePathToDocId(pagePath);
  const existing = coll.getDoc(docId);

  if (existing) {
    coll.removeDoc(docId);
  }

  const doc = coll.createDoc({ id: docId });
  seedDefaultDoc(doc);
  return doc;
}

export async function loadDoc(pagePath: string): Promise<Doc> {
  const coll = getCollection();
  const docId = pagePathToDocId(pagePath);
  const job = new Job({ collection: coll });
  const key = storageKey(pagePath);
  const raw = localStorage.getItem(key);

  if (raw) {
    try {
      const snapshot = JSON.parse(raw) as DocSnapshot;
      const existing = coll.getDoc(docId);

      if (existing) {
        coll.removeDoc(docId);
      }

      const restored = await job.snapshotToDoc(snapshot);

      if (restored) {
        if (!restored.loaded) {
          restored.load();
        }

        await waitForDocReady(restored);
        return restored;
      }
    } catch (error) {
      console.warn('[DocEditor] Invalid snapshot removed:', error);
      localStorage.removeItem(key);
    }
  }

  const doc = createFreshDoc(pagePath);
  await waitForDocReady(doc);
  return doc;
}

export function saveDocSnapshot(pagePath: string, doc: Doc) {
  const job = new Job({ collection: doc.collection });
  const snapshot = job.docToSnapshot(doc);

  if (!snapshot) {
    return;
  }

  try {
    localStorage.setItem(storageKey(pagePath), JSON.stringify(snapshot));
  } catch {
    /* ignore quota / private mode */
  }
}

export function createPageEditor(doc: Doc) {
  const editor = new PageEditor();
  editor.specs = PageEditorBlockSpecs;
  editor.doc = doc;
  return editor;
}

export function extractHeadings(doc: Doc) {
  const items: Array<{ id: string; label: string }> = [];
  const used = new Map<string, number>();

  for (const block of doc.getBlocksByFlavour('affine:paragraph')) {
    const model = block.model as {
      props?: { type?: string };
      text?: { toString(): string };
    };
    const type = model.props?.type;

    if (typeof type !== 'string' || !/^h[1-6]$/.test(type)) {
      continue;
    }

    const label = block.model.text?.toString().trim() ?? '';

    if (!label) {
      continue;
    }

    items.push({ id: uniqueSlug(label, used), label });
  }

  return items;
}

export function subscribeDocChanges(
  doc: Doc,
  onChange: () => void,
): () => void {
  const disposable = doc.slots.blockUpdated.on(onChange);

  return () => {
    disposable.dispose();
  };
}

export function clearDocSnapshot(pagePath: string) {
  localStorage.removeItem(storageKey(pagePath));
}
