import React, { useState, useRef } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";

function CustomCodeEditor() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const iframeRef = useRef(null);
  const textareaRef = useRef(null);

  const lines = code.split("\n").length;

  // Highlight JS code
  const highlightedCode = Prism.highlight(
    code,
    Prism.languages.javascript,
    "javascript"
  );

  // TAB support
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();

      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newCode =
        code.substring(0, start) +
        "  " +
        code.substring(end);

      setCode(newCode);

      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  };

  // 🟢 RUN CODE LOGIC
  const runCode = () => {
    setOutput("");

    const html = `
      <html>
        <body>
          <script>
            const logs = [];
            const originalLog = console.log;

            console.log = function(...args) {
              logs.push(args.join(" "));
              originalLog(...args);
            };

            try {
              ${code}
              window.parent.postMessage(
                { type: "log", message: logs.join("\\n") },
                "*"
              );
            } catch (err) {
              window.parent.postMessage(
                { type: "error", message: err.message },
                "*"
              );
            }
          </script>
        </body>
      </html>
    `;

    iframeRef.current.srcdoc = html;
  };

  // Receive messages from iframe
  window.onmessage = (e) => {
    if (e.data.type === "log") {
      setOutput(e.data.message || "✓ Code ran successfully");
    }
    if (e.data.type === "error") {
      setOutput("Error: " + e.data.message);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#2d2d2d] overflow-hidden">
      
      {/* 1. TOP: Run Bar (Exactly like Messages Header) */}
      <div className="h-12 border-b border-gray-700 flex items-center justify-between px-4 bg-[#1e1e1e] text-white">
        <span className="text-sm font-medium text-gray-400">main.js</span>
        <button 
          onClick={runCode}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm transition-colors"
        >
          Run Code
        </button>
      </div>

      {/* 2. MIDDLE: Scrollable Editor Area */}
      <div className="flex-1 min-h-0 relative overflow-y-auto custom-scrollbar">
        <div className="flex min-h-full">
          {/* Line Numbers */}
          <div className="w-12 bg-[#1e1e1e] text-gray-500 text-right pr-3 pt-4 select-none font-mono text-sm">
            {Array.from({ length: lines }).map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Editor Input/Highlighting */}
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck="false"
              className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-white p-4 font-mono text-sm outline-none resize-none z-10"
            />
            <pre
              aria-hidden="true"
              className="m-0 p-4 font-mono text-sm pointer-events-none whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{ __html: highlightedCode + "\n" }}
            />
          </div>
        </div>
      </div>

      {/* 3. BOTTOM: Fixed Output (Exactly like Message Input Row) */}
      <div className="h-32 border-t border-gray-700 bg-[#1e1e1e] flex flex-col">
        <div className="px-3 py-1 text-xs font-bold text-gray-500 uppercase border-b border-gray-800">
          Output
        </div>
        <div className="flex-1 p-3 overflow-y-auto font-mono text-sm text-green-400">
          {output || <span className="text-gray-600">// Execution results will appear here</span>}
        </div>
      </div>

      {/* Hidden Iframe for execution */}
      <iframe ref={iframeRef} title="output" className="hidden" />
    </div>
  );
}

export default CustomCodeEditor;
