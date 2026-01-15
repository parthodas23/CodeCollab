import React, { useState, useRef } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";

function CustomCodeEditor() {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
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

      const newCode = code.substring(0, start) + "  " + code.substring(end);

      setCode(newCode);

      requestAnimationFrame(() => {
        textareaRef.selectionStart = textareaRef.selectionEnd = start + 2;
      });
    }
  };

  const runCode = () => {
    setOutput("");

    const logs = [];
    const originalLog = console.log; // this is act like a temp varibile

    console.log = (...args) => logs.push(args.join(" "));
    // console.log("Hello")  -->  logs.push("Hello")

    try {
      eval(code); // this evaluates js code and executes it
      setOutput(logs.join("\n") || "✓ code run successfully");
    } catch (error) {
      setOutput("Error: " + error.message);
    }
    console.log = originalLog; // here we used the temp var
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#2d2d2d] overflow-hidden">
      {/* run bar */}
      <div className="h-12 border-b border-gray-700 flex items-center justify-between px-4 bg-[#1e1e1e] text-white">
        <span className="text-sm font-medium text-gray-400">main.js</span>
        <button
          onClick={runCode}
          className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded text-sm transition-colors"
        >
          Run Code
        </button>
      </div>

      {/* editor area */}
      <div className="flex-1 min-h-0 relative overflow-y-auto custom-scrollbar">
        <div className="min-h-full flex">
          {/* line numbers */}
          <div className="w-12 bg-[#1e1e1e] text-gray-500 pr-3 pt-4 text-sm font-mono text-right">
            {Array.from({ length: lines }).map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          {/* editor input area */}
          <div className="relative flex-1">
            <textarea
              className="absolute inset-0 w-full h-full resize-none outline-none bg-transparent caret-white text-transparent p-4 font-mono text-sm z-10"
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck="false"
              onKeyDown={handleKeyDown}
            />
            <pre
              aria-hidden="true"
              className="m-0 p-4 font-mono text-sm pointer-events-none whitespace-pre-wrap wrap-break-word text-gray-100"
              dangerouslySetInnerHTML={{ __html: highlightedCode + "\n" }}
            />
          </div>
        </div>
      </div>
      {/* fixed output */}

      <div className="h-34 border-t border-gray-700 bg-[#1e1e1e] flex flex-col">
        <div className="px-3 py-1 text-xs text-gray-500 font-bold uppercase border-b border-gray-800">
          Output
        </div>
        <div className="flex-1 p-3 text-green-500 font-mono text-sm overflow-y-auto whitespace-pre-wrap">
          {output || <span> Exicution will be appear here </span>}
        </div>
      </div>
    </div>
  );
}

export default CustomCodeEditor;
