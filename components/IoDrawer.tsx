
import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';

interface IoDrawerProps {
  isVisible: boolean;
  isExecuting: boolean;
  output: string | null;
  error: string | null;
  html: string | null;
  onClose: () => void;
  onDebug: (error: string) => void;
  onResizeStart: (e: React.MouseEvent) => void;
  drawerHeight: number;
}

type ActiveTab = 'output' | 'error' | 'preview';

// Helper to guess language for syntax highlighting
const getOutputLanguage = (text: string | null): string => {
    if (!text) return 'plaintext';
    const trimmedText = text.trim();
    if ((trimmedText.startsWith('{') && trimmedText.endsWith('}')) || (trimmedText.startsWith('[') && trimmedText.endsWith(']'))) {
        try {
            JSON.parse(trimmedText);
            return 'json'; // It's valid JSON
        } catch (e) {
            // Not JSON, continue
        }
    }
    // Simple check for Python traceback
    if (trimmedText.includes('Traceback (most recent call last):') && trimmedText.includes('File "')) {
        return 'python';
    }
    // Simple check for JS error
    if (trimmedText.match(/^\w*Error:/)) {
        return 'javascript';
    }
    return 'plaintext';
};


export const IoDrawer: React.FC<IoDrawerProps> = ({ isVisible, isExecuting, output, error, html, onClose, onDebug, onResizeStart, drawerHeight }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('output');

  useEffect(() => {
    // When execution completes, switch to the most relevant tab.
    if (!isExecuting) {
        if (html) {
            setActiveTab('preview');
        } else if (error) {
            setActiveTab('error');
        } else if (output) {
            setActiveTab('output');
        }
    }
  }, [isExecuting, error, html, output]);

  const TabButton: React.FC<{ tabName: ActiveTab; label: string; hasError: boolean }> = ({ tabName, label, hasError }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 relative ${
        activeTab === tabName
          ? 'text-aura-accent border-aura-accent'
          : 'text-aura-text-secondary border-transparent hover:text-aura-text-primary'
      }`}
    >
      {label}
      {hasError && <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-aura-surface" />}
    </button>
  );
  
  const editorOptions = {
      readOnly: true,
      minimap: { enabled: false },
      wordWrap: 'on' as const,
      fontSize: 13,
      fontFamily: "'JetBrains Mono', monospace",
      lineNumbers: 'on' as const,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      glyphMargin: false,
      folding: true,
      lineDecorationsWidth: 5,
      lineNumbersMinChars: 3,
      padding: { top: 10, bottom: 10 },
      contextmenu: false,
  };


  return (
    <div
      className={`absolute bottom-0 left-0 right-0 bg-aura-surface border-t border-aura-border shadow-2xl z-20 transform transition-transform duration-300 ease-in-out flex flex-col ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{ height: `${drawerHeight}px` }}
      aria-hidden={!isVisible}
    >
      <div
        onMouseDown={onResizeStart}
        className="absolute -top-1 left-0 right-0 h-2 cursor-row-resize z-30 group"
        role="separator"
        aria-label="Resize panel"
      >
        <div className="h-full w-full bg-transparent group-hover:bg-aura-accent/50 transition-colors duration-200" />
      </div>
      <header className="flex items-center justify-between h-12 px-4 border-b border-aura-border flex-shrink-0">
        <div className="flex items-center">
          <TabButton tabName="output" label="Output" hasError={false}/>
          {html && <TabButton tabName="preview" label="Preview" hasError={false} />}
          <TabButton tabName="error" label="Error" hasError={!!error} />
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-aura-text-secondary hover:bg-aura-panel hover:text-aura-text-primary transition-colors"
          aria-label="Close I/O Panel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </header>
      <div className="flex-1 overflow-hidden bg-aura-bg">
        {isExecuting ? (
          <div className="flex items-center justify-center h-full text-aura-text-secondary">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span>Executing...</span>
          </div>
        ) : (
            <>
                <div className={activeTab === 'output' ? 'h-full' : 'hidden'}>
                    <MonacoEditor
                        height="100%"
                        language={getOutputLanguage(output)}
                        theme="auraTheme"
                        value={output || 'Code has not been run yet. Click "Run" to see output.'}
                        options={editorOptions}
                    />
                </div>
                <div className={activeTab === 'preview' ? 'block h-full' : 'hidden'}>
                    {html && (
                        <iframe
                            srcDoc={html}
                            title="Execution Preview"
                            sandbox="allow-scripts allow-modals allow-forms"
                            className="w-full h-full border-none bg-white"
                        />
                    )}
                </div>
                <div className={activeTab === 'error' ? 'h-full flex flex-col' : 'hidden'}>
                    {error ? (
                    <div className="flex-1 flex flex-col p-4 gap-4">
                        <div className="flex-1 relative border border-red-500/20 rounded-md overflow-hidden">
                            <MonacoEditor
                                height="100%"
                                language={getOutputLanguage(error)}
                                theme="auraTheme"
                                value={error}
                                options={editorOptions}
                            />
                        </div>
                        <div className="flex-shrink-0">
                            <button
                                onClick={() => onDebug(error)}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 bg-aura-accent text-white shadow-lg shadow-aura-accent/20 hover:bg-aura-accent-hover"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3L9.5 8.5L4 10l5.5 5.5L8 21l4-3 4 3-1.5-5.5L20 10l-5.5-1.5Z"/></svg>
                                Ask Aura to Debug
                            </button>
                        </div>
                    </div>
                    ) : (
                    <p className="p-4 text-sm text-aura-text-secondary">No errors found.</p>
                    )}
                </div>
            </>
        )}
      </div>
    </div>
  );
};
