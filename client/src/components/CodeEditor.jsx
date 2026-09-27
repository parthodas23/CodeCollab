import React, { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { EditorView, basicSetup } from "codemirror";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { yCollab, yUndoManagerKeymap } from "y-codemirror.next";

// keep the old editor colors
const editorTheme = EditorView.theme(
  {
    "&": { height: "100%", fontSize: "14px", backgroundColor: "#2d2d2d" },
    ".cm-gutters": { backgroundColor: "#1e1e1e", border: "none" },
  },
  { dark: true },
);

// runs in a Web Worker with its own origin: no access to the page, the token or the API,
// and an endless loop can be stopped
const runner = `onmessage = (e) => {
  const logs = [];
  const show = (v) => (typeof v === "object" ? JSON.stringify(v) : String(v));
  console.log = console.info = console.warn = console.error = (...args) => logs.push(args.map(show).join(" "));
  try { new Function(e.data)(); } catch (error) { logs.push("Error: " + error.message); }
  postMessage(logs.join("\\n") || "✓ code run successfully");
};`;

function CodeEditor({ ytext, awareness, fileName }) {
  const [output, setOutput] = useState("");
  const editorRef = useRef(null);

  // bind CodeMirror to the shared Y.Text: edits, remote cursors and undo all go through Yjs
  useEffect(() => {
    const undoManager = new Y.UndoManager(ytext);
    const view = new EditorView({
      doc: ytext.toString(),
      parent: editorRef.current,
      extensions: [
        keymap.of([...yUndoManagerKeymap, indentWithTab]), // Ctrl+Z undoes only your own edits, Tab indents
        yCollab(ytext, awareness, { undoManager }),
        basicSetup,
        javascript(),
        editorTheme, // before oneDark so it wins
        oneDark,
      ],
    });

    return () => {
      view.destroy();
      undoManager.destroy();
    };
  }, [ytext, awareness]);

  const runCode = () => {
    const worker = new Worker(`data:text/javascript,${encodeURIComponent(runner)}`);
    const timer = setTimeout(() => {
      worker.terminate();
      setOutput("Error: stopped after 3 seconds (infinite loop?)");
    }, 3000);

    worker.onmessage = (e) => {
      clearTimeout(timer);
      worker.terminate();
      setOutput(e.data);
    };
    setOutput("Running...");
    worker.postMessage(ytext.toString());
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#2d2d2d] overflow-hidden">
      {/* run bar */}
      <div className="h-12 border-b border-gray-700 flex items-center justify-between px-4 bg-[#1e1e1e] text-white">
        <span className="text-sm font-medium text-gray-400">{fileName}</span>
        <button
          onClick={runCode}
          className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded text-sm transition-colors"
        >
          Run Code
        </button>
      </div>

      {/* editor area */}
      <div ref={editorRef} className="flex-1 min-h-0" />

      {/* fixed output */}
      <div className="h-34 border-t border-gray-700 bg-[#1e1e1e] flex flex-col">
        <div className="px-3 py-1 text-xs text-gray-500 font-bold uppercase border-b border-gray-800">
          Output
        </div>
        <div className="flex-1 p-3 text-green-500 font-mono text-sm overflow-y-auto whitespace-pre-wrap">
          {output || <span className="text-gray-500">Execution output will appear here</span>}
        </div>
      </div>
    </div>
  );
}

export default CodeEditor;
