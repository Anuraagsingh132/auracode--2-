
import React, { useRef } from 'react';
import MonacoEditor, { OnMount, loader } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

// Define the custom theme once, ensuring it's available when the editor loads.
loader.init().then(monaco => {
  monaco.editor.defineTheme('auraTheme', {
    base: 'vs-dark',
    inherit: true,
    rules: [
        { token: 'comment', foreground: '#b8c1ec', fontStyle: 'italic' },
        { token: 'keyword', foreground: '#e06c75' },
        { token: 'number', foreground: '#d19a66' },
        { token: 'string', foreground: '#98c379' },
        { token: 'operator', foreground: '#56b6c2' },
        { token: 'identifier', foreground: '#abb2bf' },
        { token: 'type.identifier', foreground: '#c678dd' },
        { token: 'delimiter', foreground: '#b8c1ec' },
        { token: 'tag', foreground: '#e06c75'},
        { token: 'attribute.name', foreground: '#d19a66'},
        { token: 'attribute.value', foreground: '#98c379'},
        { token: 'predefined', foreground: '#c678dd'},
    ],
    colors: {
      'editor.background': '#1a1a2e',
      'editor.foreground': '#fffffe',
      'editorGutter.background': '#1a1a2e',
      'editor.lineHighlightBackground': '#23294680',
      'editorCursor.foreground': '#7f5af0',
      'editor.selectionBackground': '#3b3e6e90',
      'editorActiveLineNumber.foreground': '#7f5af0',
      'editorLineNumber.foreground': '#3b3e6e',
      'editorWidget.background': '#232946',
      'editorWidget.border': '#3b3e6e',
      'dropdown.background': '#232946',
      'dropdown.border': '#3b3e6e',
      'input.background': '#232946',
      'peekView.border': '#7f5af0',
      'peekViewResult.background': '#232946',
      'peekViewEditor.background': '#1a1a2e',
      'peekViewTitle.background': '#232946',
    },
  });
});

interface EditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  onSelectionChange: (selection: string) => void;
  onMouseUpWithSelection: (position: { top: number; left: number } | null) => void;
  onEditorMount: (editor: editor.IStandaloneCodeEditor, monaco: any) => void;
  isReadOnly?: boolean;
}

export const Editor: React.FC<EditorProps> = ({ value, language, onChange, onSelectionChange, onMouseUpWithSelection, onEditorMount, isReadOnly = false }) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleMount: OnMount = (editorInstance, monacoInstance) => {
    editorRef.current = editorInstance;
    onEditorMount(editorInstance, monacoInstance);

    // Listen for selection changes to update the selection state
    editorInstance.onDidChangeCursorSelection(e => {
        const model = editorInstance.getModel();
        if (model) {
            const selectedText = model.getValueInRange(e.selection);
            onSelectionChange(selectedText);
            // Hide menu if selection becomes empty
            if (e.selection.isEmpty()) {
                onMouseUpWithSelection(null);
            }
        }
    });

    // Listen for mouse up events to position the floating menu
    editorInstance.onMouseUp(e => {
        const selection = editorInstance.getSelection();
        if (selection && !selection.isEmpty()) {
            // Use the browser event coordinates to position the menu
            onMouseUpWithSelection({ top: e.event.posy - 50, left: e.event.posx });
        }
    });

    // Hide menu when the editor loses focus
    editorInstance.onDidBlurEditorWidget(() => {
        onMouseUpWithSelection(null);
    });
  };

  return (
    <div className="flex-1 bg-aura-panel relative overflow-hidden">
      <MonacoEditor
        height="100%"
        language={language}
        theme="auraTheme"
        value={value}
        onChange={(newValue) => onChange(newValue || '')}
        onMount={handleMount}
        options={{
          readOnly: isReadOnly,
          minimap: { enabled: false },
          wordWrap: 'on',
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          renderWhitespace: 'none',
          glyphMargin: true,
          folding: true,
          lineDecorationsWidth: 5,
          lineNumbersMinChars: 3,
          padding: { top: 16, bottom: 16 },
          fixedOverflowWidgets: true,
          contextmenu: false, // Use our custom context menu
        }}
      />
      {isReadOnly && (
        <div className="absolute inset-0 flex items-center justify-center bg-aura-panel/80 pointer-events-none z-10">
          <p className="text-aura-text-secondary text-lg">Select a file to begin coding</p>
        </div>
      )}
    </div>
  );
};
