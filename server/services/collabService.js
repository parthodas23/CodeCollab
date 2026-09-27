import * as Y from "yjs";
import Project from "../model/Project.js";

// One Y.Doc per open project. Every file is a Y.Text inside doc.getMap("files"),
// so concurrent edits are merged by the CRDT instead of overwriting each other.
const docs = new Map(); // projectId -> Promise<Y.Doc>
const saving = new Map(); // projectId -> last DB write (writes run one after another)

const save = (projectId, doc) => {
  clearTimeout(doc.saveTimer);
  const saved = (saving.get(projectId) || Promise.resolve())
    .then(() =>
      Project.updateOne(
        { _id: projectId },
        {
          ydoc: Buffer.from(Y.encodeStateAsUpdate(doc)),
          // plain-text copy, easy to read in the DB
          files: [...doc.getMap("files")].map(([name, text]) => ({
            name,
            content: text.toString(),
          })),
        },
      ),
    )
    .catch((err) => console.log("Could not save project:", err.message));
  saving.set(projectId, saved);
  return saved;
};

const load = async (projectId) => {
  await saving.get(projectId); // let the last save of a previous copy finish
  const project = await Project.findById(projectId).select("+ydoc files");
  const doc = new Y.Doc();
  doc.conns = 0;

  if (project.ydoc) {
    Y.applyUpdate(doc, project.ydoc);
  } else {
    // first open: turn the old plain-text files (or a starter file) into Y.Text
    const files = project.files.length
      ? project.files
      : [{ name: "main.js", content: 'console.log("Hello World");\n' }];
    files.forEach((f) => doc.getMap("files").set(f.name, new Y.Text(f.content)));
    await save(projectId, doc); // saved before anyone syncs, so it is never rebuilt twice
  }

  // save 2s after people stop typing
  doc.on("update", () => {
    clearTimeout(doc.saveTimer);
    doc.saveTimer = setTimeout(() => save(projectId, doc), 2000);
  });
  return doc;
};

export const joinDoc = async (projectId) => {
  if (!docs.has(projectId)) {
    const loading = load(projectId);
    loading.catch(() => docs.delete(projectId));
    docs.set(projectId, loading);
  }
  const loading = docs.get(projectId);
  const doc = await loading;
  if (docs.get(projectId) !== loading) return joinDoc(projectId); // unloaded meanwhile
  doc.conns++;
  return doc;
};

// last user left: save now and free the memory
export const leaveDoc = (projectId, doc) => {
  if (--doc.conns > 0) return;
  docs.delete(projectId);
  save(projectId, doc).then(() => doc.destroy());
};
