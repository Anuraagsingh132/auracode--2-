
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Dock } from './components/Dock';
import { AppHeader } from './components/Header';
import { Editor } from './components/Editor';
import { StatusBar } from './components/StatusBar';
import { AiPanel } from './components/AiPanel';
import { IoDrawer } from './components/IoDrawer';
import { FloatingMenu } from './components/FloatingMenu';
import { CommandPalette, Command } from './components/CommandPalette';
import { ExplorerPanel } from './components/ExplorerPanel';
import { TabsBar } from './components/TabsBar';
import { explainCode, debugCode, askFollowUp } from './services/geminiService';
import { runCode } from './services/executionService';
import { DEFAULT_CODES, README_CONTENT, SUPPORTED_LANGUAGES } from './constants';
import type { editor } from 'monaco-editor';


// --- TYPES ---
export interface FileItem {
  id: string;
  name: string;
  type: 'file';
  language: string;
  content: string;
}

export interface FolderItem {
  id: string;
  name: string;
  type: 'folder';
  children: FileSystemItem[];
}

export type FileSystemItem = FileItem | FolderItem;

export interface AiMessage {
    role: 'user' | 'model';
    content: string;
}

// --- UTILITIES ---
const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const findItem = (items: FileSystemItem[], itemId: string): FileSystemItem | null => {
  for (const item of items) {
    if (item.id === itemId) return item;
    if (item.type === 'folder') {
      const found = findItem(item.children, itemId);
      if (found) return found;
    }
  }
  return null;
};

const findFirstFile = (items: FileSystemItem[]): FileItem | null => {
    for (const item of items) {
        if (item.type === 'file') return item;
        if (item.type === 'folder') {
            const firstFile = findFirstFile(item.children);
            if (firstFile) return firstFile;
        }
    }
    return null;
}

// --- INITIAL STATE ---
const getInitialFileSystem = (): FileSystemItem[] => {
  try {
    const saved = localStorage.getItem('auracode_filesystem');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load filesystem from localStorage", e);
  }
  // Default state for first-time users
  return [
    {
      id: generateId(),
      name: 'src',
      type: 'folder',
      children: [
        {
          id: generateId(),
          name: 'script.js',
          type: 'file',
          language: 'javascript',
          content: DEFAULT_CODES['javascript'],
        },
        {
          id: generateId(),
          name: 'script.ts',
          type: 'file',
          language: 'typescript',
          content: DEFAULT_CODES['typescript'],
        },
        {
          id: generateId(),
          name: 'index.html',
          type: 'file',
          language: 'html',
          content: DEFAULT_CODES['html'],
        },
        {
          id: generateId(),
          name: 'script.py',
          type: 'file',
          language: 'python',
          content: DEFAULT_CODES['python'],
        }
      ]
    },
    {
      id: generateId(),
      name: 'simulated_languages',
      type: 'folder',
      children: [
        {
          id: generateId(),
          name: 'main.cpp',
          type: 'file',
          language: 'cpp',
          content: DEFAULT_CODES['cpp'],
        },
        {
          id: generateId(),
          name: 'Main.java',
          type: 'file',
          language: 'java',
          content: DEFAULT_CODES['java'],
        },
        {
          id: generateId(),
          name: 'main.go',
          type: 'file',
          language: 'go',
          content: DEFAULT_CODES['go'],
        },
        {
          id: generateId(),
          name: 'main.dart',
          type: 'file',
          language: 'dart',
          content: DEFAULT_CODES['dart'],
        },
        {
          id: generateId(),
          name: 'App.kt',
          type: 'file',
          language: 'kotlin',
          content: DEFAULT_CODES['kotlin'],
        },
      ]
    },
    {
      id: generateId(),
      name: 'README.md',
      type: 'file',
      language: 'markdown',
      content: README_CONTENT
    }
  ];
};

const getInitialActiveFileId = (fs: FileSystemItem[]): string | null => {
    try {
        const savedId = localStorage.getItem('auracode_activeFileId');
        if (savedId && findItem(fs, savedId)?.type === 'file') {
            return savedId;
        }
    } catch (e) { console.error(e) }
    return findFirstFile(fs)?.id ?? null;
};

const getInitialOpenFileIds = (fs: FileSystemItem[], activeId: string | null): string[] => {
    try {
        const saved = localStorage.getItem('auracode_openFileIds');
        if (saved) {
            const ids = JSON.parse(saved) as string[];
            // Filter out any IDs that no longer exist in the file system
            return ids.filter(id => findItem(fs, id));
        }
    } catch (e) { console.error(e); }
    // Default: just the active file, if it exists
    return activeId ? [activeId] : [];
};

const App: React.FC = () => {
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>(getInitialFileSystem);
  const [activeFileId, setActiveFileId] = useState<string | null>(() => getInitialActiveFileId(fileSystem));
  const [openFileIds, setOpenFileIds] = useState<string[]>(() => getInitialOpenFileIds(fileSystem, activeFileId));

  const [selectedText, setSelectedText] = useState<string>('');
  const [aiConversation, setAiConversation] = useState<AiMessage[]>([]);
  const [isAiPanelVisible, setIsAiPanelVisible] = useState<boolean>(true);
  const [isExplorerVisible, setIsExplorerVisible] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isIoDrawerVisible, setIsIoDrawerVisible] = useState<boolean>(false);
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [executionHtml, setExecutionHtml] = useState<string | null>(null);
  const [drawerHeight, setDrawerHeight] = useState(256); // 16rem
  const [isFullscreen, setIsFullscreen] = useState(false);


  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const isResizingRef = useRef(false);

  const activeFile = (activeFileId ? findItem(fileSystem, activeFileId) : null) as FileItem | null;
  const code = activeFile?.content ?? '';
  const language = activeFile?.language ?? 'plaintext';
  const isRunnable = language !== 'markdown';
  
  const getPath = useCallback((id: string | null): string => {
    if (!id) return '/workspace';
    const pathParts: string[] = [];
    const find = (items: FileSystemItem[], targetId: string): boolean => {
      for (const item of items) {
        if (item.id === targetId) {
          pathParts.unshift(item.name);
          return true;
        }
        if (item.type === 'folder' && find(item.children, targetId)) {
          pathParts.unshift(item.name);
          return true;
        }
      }
      return false;
    };
    find(fileSystem, id);
    return `/workspace/${pathParts.join('/')}`;
  }, [fileSystem]);

  const activeFilePath = getPath(activeFileId);
  const currentLanguageDetails = SUPPORTED_LANGUAGES.find(l => l.id === language) || { id: language, name: language, filename: activeFile?.name || 'file' };

  const handleFileSelect = useCallback((fileId: string) => {
    const item = findItem(fileSystem, fileId);
    if (item?.type === 'file') {
      if (!openFileIds.includes(fileId)) {
        setOpenFileIds(currentOpen => [...currentOpen, fileId]);
      }
      if (fileId !== activeFileId) {
        setActiveFileId(fileId);
        setExecutionOutput(null);
        setExecutionError(null);
        setExecutionHtml(null);
        setIsIoDrawerVisible(false);
      }
    }
  }, [fileSystem, activeFileId, openFileIds]);

  const handleTabSelect = useCallback((fileId: string) => {
    setActiveFileId(fileId);
  }, []);

  const handleCloseTab = useCallback((fileIdToClose: string) => {
    const currentIndex = openFileIds.indexOf(fileIdToClose);
    const newOpenFileIds = openFileIds.filter(id => id !== fileIdToClose);

    if (activeFileId === fileIdToClose) {
        if (newOpenFileIds.length === 0) {
            setActiveFileId(null);
        } else {
            const newActiveIndex = Math.max(0, currentIndex - 1);
            setActiveFileId(newOpenFileIds[newActiveIndex]);
        }
    }
    setOpenFileIds(newOpenFileIds);
  }, [openFileIds, activeFileId]);

  const handleCodeChange = useCallback((newCode: string) => {
    if (!activeFileId) return;
    setFileSystem(currentFS => {
      const recursiveUpdate = (items: FileSystemItem[]): FileSystemItem[] => {
        return items.map(item => {
          if (item.id === activeFileId) {
            return { ...item, content: newCode } as FileItem;
          }
          if (item.type === 'folder') {
            return { ...item, children: recursiveUpdate(item.children) };
          }
          return item;
        });
      };
      return recursiveUpdate(currentFS);
    });
  }, [activeFileId]);
  
  const handleCreateItem = useCallback((parentId: string | null, type: 'file' | 'folder', name: string) => {
    const newItem: FileSystemItem = type === 'file' 
      ? { 
          id: generateId(), 
          name, 
          type: 'file', 
          language: SUPPORTED_LANGUAGES.find(l => name.endsWith(l.filename.substring(l.filename.lastIndexOf('.'))))?.id || 'plaintext',
          content: DEFAULT_CODES[SUPPORTED_LANGUAGES.find(l => name.endsWith(l.filename.substring(l.filename.lastIndexOf('.'))))?.id || ''] || `// ${name}`
        }
      : { id: generateId(), name, type: 'folder', children: [] };

    setFileSystem(currentFS => {
        const recursiveAdd = (items: FileSystemItem[]): FileSystemItem[] => {
            if (parentId === null) {
                return [...items, newItem];
            }
            return items.map(item => {
                if (item.id === parentId && item.type === 'folder') {
                    return { ...item, children: [...item.children, newItem] };
                }
                if (item.type === 'folder') {
                    return { ...item, children: recursiveAdd(item.children) };
                }
                return item;
            });
        };
        return recursiveAdd(currentFS);
    });
    
    if(newItem.type === 'file') {
        handleFileSelect(newItem.id);
    }
  }, [handleFileSelect]);

  const handleRenameItem = useCallback((itemId: string, newName: string) => {
      setFileSystem(currentFS => {
          const recursiveRename = (items: FileSystemItem[]): FileSystemItem[] => {
              return items.map(item => {
                  if (item.id === itemId) {
                      const updatedItem = { ...item, name: newName };
                      if(updatedItem.type === 'file') {
                          const lang = SUPPORTED_LANGUAGES.find(l => newName.endsWith(l.filename.substring(l.filename.lastIndexOf('.'))))?.id || 'plaintext';
                          updatedItem.language = lang;
                      }
                      return updatedItem;
                  }
                  if (item.type === 'folder') {
                      return { ...item, children: recursiveRename(item.children) };
                  }
                  return item;
              });
          };
          return recursiveRename(currentFS);
      });
  }, []);
  
  const handleDeleteItem = useCallback((itemId: string) => {
    const itemToDelete = findItem(fileSystem, itemId);
    if (!itemToDelete) return;

    if (!window.confirm(`Are you sure you want to delete "${itemToDelete.name}"? This cannot be undone.`)) {
      return;
    }
    
    const idsToDelete = new Set<string>();
    const collectIds = (item: FileSystemItem) => {
        idsToDelete.add(item.id);
        if (item.type === 'folder') {
            item.children.forEach(collectIds);
        }
    };
    collectIds(itemToDelete);

    // Close any tabs corresponding to deleted files
    const remainingOpenFileIds = openFileIds.filter(id => !idsToDelete.has(id));
    let newActiveFileId = activeFileId;
    
    if (activeFileId && idsToDelete.has(activeFileId)) {
        newActiveFileId = remainingOpenFileIds.length > 0 ? remainingOpenFileIds[remainingOpenFileIds.length - 1] : null;
    }
    
    setOpenFileIds(remainingOpenFileIds);
    if (newActiveFileId !== activeFileId) {
      setActiveFileId(newActiveFileId);
    }

    setFileSystem(currentFS => {
        const recursiveDelete = (items: FileSystemItem[], idToDelete: string): FileSystemItem[] => {
            return items
                .filter(item => item.id !== idToDelete)
                .map(item => {
                    if (item.type === 'folder') {
                        return { ...item, children: recursiveDelete(item.children, idToDelete) };
                    }
                    return item;
                });
        };
        const newFS = recursiveDelete(currentFS, itemId);

        if (findFirstFile(newFS) === null) {
            const newReadme: FileItem = { id: generateId(), name: 'README.md', type: 'file', language: 'markdown', content: README_CONTENT };
            setActiveFileId(newReadme.id);
            setOpenFileIds([newReadme.id]);
            return [newReadme];
        }
        return newFS;
    });
  }, [fileSystem, openFileIds, activeFileId]);
  
  const handleMoveItem = useCallback((itemId: string, newParentId: string | null) => {
    let draggedItem: FileSystemItem | null = null;
    if (itemId === newParentId) return; // Cannot drop on self

    // Check for dropping a folder into its own descendant
    const isDescendant = (folder: FolderItem, id: string): boolean => {
      if (folder.id === id) return true;
      return folder.children.some(child => child.type === 'folder' && isDescendant(child, id));
    };

    setFileSystem(currentFS => {
      // 1. Find and remove the item from its original location
      const recursiveRemove = (items: FileSystemItem[], idToRemove: string): FileSystemItem[] => {
        const filteredItems = [];
        for (const item of items) {
          if (item.id === idToRemove) {
            draggedItem = item;
          } else {
            if (item.type === 'folder') {
              filteredItems.push({ ...item, children: recursiveRemove(item.children, idToRemove) });
            } else {
              filteredItems.push(item);
            }
          }
        }
        return filteredItems;
      };

      const fsWithoutItem = recursiveRemove(currentFS, itemId);
      if (!draggedItem) return currentFS; // Item not found, something went wrong

      if (draggedItem.type === 'folder' && newParentId && isDescendant(draggedItem, newParentId)) {
        return currentFS; // Invalid move, do nothing
      }
      
      // 2. Add the item to its new parent
      const recursiveAdd = (items: FileSystemItem[], parentId: string | null): FileSystemItem[] => {
        if (parentId === null) {
          return [...items, draggedItem!]; // Add to root
        }
        return items.map(item => {
          if (item.id === parentId && item.type === 'folder') {
            return { ...item, children: [...item.children, draggedItem!] };
          }
          if (item.type === 'folder') {
            return { ...item, children: recursiveAdd(item.children, parentId) };
          }
          return item;
        });
      };
      
      return recursiveAdd(fsWithoutItem, newParentId);
    });
  }, []);

  const handleSelectionChange = useCallback((selection: string) => {
    setSelectedText(selection);
  }, []);
  
  const handleMouseUpWithSelection = useCallback((position: { top: number; left: number } | null) => {
    setMenuPosition(position);
  }, []);

  const handleExplain = useCallback(async () => {
    if (!selectedText || isLoading || !activeFileId) return;
    setMenuPosition(null);
    setIsLoading(true);
    setIsAiPanelVisible(true);
    setAiConversation([]);
    setError(null);
    try {
      const explanation = await explainCode(selectedText, language, fileSystem, activeFileId);
      setAiConversation([{ role: 'model', content: explanation }]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Sorry, I encountered an error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedText, isLoading, language, fileSystem, activeFileId]);
  
  const handleRunCode = useCallback(async () => {
    if (isExecuting || !isRunnable || !activeFile) return;
    setIsExecuting(true);
    setIsIoDrawerVisible(true);
    setExecutionOutput(null);
    setExecutionError(null);
    setExecutionHtml(null);
    try {
      const result = await runCode(code, language);
      if (result.html) {
        setExecutionHtml(result.html);
      } else if (result.error) {
        setExecutionError(result.error);
      } else {
        setExecutionOutput(result.output ?? '');
      }
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setExecutionError(`An unexpected error occurred during execution: ${errorMessage}`);
    } finally {
        setIsExecuting(false);
    }
  }, [code, isExecuting, language, isRunnable, activeFile]);
  
  const handleDebugError = useCallback(async (errorToDebug: string) => {
    if (!activeFile) return;
    setIsLoading(true);
    setIsAiPanelVisible(true);
    setAiConversation([]);
    setError(null);
    try {
      const explanation = await debugCode(code, errorToDebug, language, fileSystem, activeFile.id);
      setAiConversation([{ role: 'model', content: explanation }]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Sorry, I couldn't get debugging help: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [code, language, activeFile, fileSystem]);

  const handleAskFollowUp = useCallback(async (question: string) => {
    if (isLoading || !question.trim()) return;

    const updatedConversation: AiMessage[] = [...aiConversation, { role: 'user', content: question }];
    setAiConversation(updatedConversation);
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await askFollowUp(updatedConversation, fileSystem, activeFileId);
      setAiConversation(c => [...c, { role: 'model', content: response }]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Sorry, I encountered an error with your follow-up: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, aiConversation, fileSystem, activeFileId]);

  const runCodeRef = useRef(handleRunCode);
  useEffect(() => {
    runCodeRef.current = handleRunCode;
  }, [handleRunCode]);

  const handleEditorMount = (editor: editor.IStandaloneCodeEditor, monaco: any) => {
    editorRef.current = editor;

    // Action to open command palette
    editor.addAction({
      id: 'open-command-palette',
      label: 'Open Command Palette',
      keybindings: [
        // eslint-disable-next-line no-bitwise
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK,
      ],
      run: () => setIsPaletteOpen(p => !p),
    });

    // Action to run code
    editor.addAction({
      id: 'run-code',
      label: 'Run Code',
      keybindings: [
        // eslint-disable-next-line no-bitwise
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      ],
      run: () => runCodeRef.current(),
    });
  };

  const handleFormatCode = useCallback(() => {
    editorRef.current?.getAction('editor.action.formatDocument')?.run();
  }, []);

  // --- Resizing and Fullscreen Logic ---
  const handleResizeMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizingRef.current) return;
    const newHeight = window.innerHeight - e.clientY;
    const minHeight = 80; // 5rem
    const maxHeight = window.innerHeight - 150; // Leave space for editor header
    setDrawerHeight(Math.max(minHeight, Math.min(newHeight, maxHeight)));
  }, []);

  const handleResizeMouseUp = useCallback(() => {
    isResizingRef.current = false;
    window.removeEventListener('mousemove', handleResizeMouseMove);
    window.removeEventListener('mouseup', handleResizeMouseUp);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, [handleResizeMouseMove]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    window.addEventListener('mousemove', handleResizeMouseMove);
    window.addEventListener('mouseup', handleResizeMouseUp);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, [handleResizeMouseMove, handleResizeMouseUp]);

  const handleFullscreenToggle = useCallback(() => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            alert(`Could not enter fullscreen mode: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
        document.removeEventListener('fullscreenchange', onFullscreenChange);
        // Ensure event listeners for resizing are cleaned up on unmount
        window.removeEventListener('mousemove', handleResizeMouseMove);
        window.removeEventListener('mouseup', handleResizeMouseUp);
    };
  }, [handleResizeMouseMove, handleResizeMouseUp]);
  

  // Save state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('auracode_filesystem', JSON.stringify(fileSystem));
      if (activeFileId) localStorage.setItem('auracode_activeFileId', activeFileId);
      else localStorage.removeItem('auracode_activeFileId');
      localStorage.setItem('auracode_openFileIds', JSON.stringify(openFileIds));
    } catch (error) {
        console.error("Failed to save state to localStorage", error);
    }
  }, [fileSystem, activeFileId, openFileIds]);

  // Welcome message
  useEffect(() => {
    const savedFiles = localStorage.getItem('auracode_filesystem');
    const welcomeMessage = savedFiles === null
        ? "Welcome to AuraCode! \n\n- Create files and folders using the icons in the explorer. \n- Write code and click **Run** to execute it. \n- Highlight code to bring up the **Floating Menu** for an explanation. \n- Press **Cmd/Ctrl+K** to open the Command Palette."
        : "Welcome back! Your workspace was restored from your last session.";
    setAiConversation([{ role: 'model', content: welcomeMessage }]);
  }, []);

  // Keyboard shortcuts for global context (outside editor)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // These are handled by Monaco when the editor has focus.
      // This listener handles them when it does not.
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        handleRunCode();
      }
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsPaletteOpen(p => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleRunCode]);

  const commands: Command[] = [
    { name: 'Format Document', action: handleFormatCode, disabled: !activeFileId },
  ];
  if (selectedText) {
    commands.unshift({ name: 'Explain Selection', action: handleExplain, disabled: isLoading });
  }
  if (executionError) {
    commands.unshift({ name: 'Debug Last Error', action: () => handleDebugError(executionError), disabled: isLoading });
  }
  commands.push(
    { name: 'Run Code', action: handleRunCode, disabled: isExecuting || !isRunnable },
    { name: 'Toggle AI Panel', action: () => setIsAiPanelVisible((p) => !p) },
    { name: 'Toggle Explorer', action: () => setIsExplorerVisible((p) => !p) },
    { name: 'Toggle I/O Drawer', action: () => setIsIoDrawerVisible((p) => !p) },
    { name: 'Close Command Palette', action: () => setIsPaletteOpen(false) }
  );
  
  const openFiles = openFileIds
    .map(id => findItem(fileSystem, id))
    .filter((item): item is FileItem => !!item && item.type === 'file');

  return (
    <div className="flex h-screen bg-aura-bg text-aura-text-primary overflow-hidden">
      <Dock
        isExplorerVisible={isExplorerVisible}
        onToggleExplorer={() => setIsExplorerVisible(p => !p)}
        isAiPanelVisible={isAiPanelVisible}
        onToggleAiPanel={() => setIsAiPanelVisible(p => !p)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleFullscreenToggle}
      />
       <ExplorerPanel
        isVisible={isExplorerVisible}
        onClose={() => setIsExplorerVisible(false)}
        fileSystem={fileSystem}
        activeFileId={activeFileId}
        onFileSelect={handleFileSelect}
        onCreateItem={handleCreateItem}
        onRenameItem={handleRenameItem}
        onDeleteItem={handleDeleteItem}
        onMoveItem={handleMoveItem}
       />
      <main className="flex flex-col flex-1 h-screen min-w-0">
        <AppHeader
          filename={activeFile?.name || 'No file selected'}
          filePath={activeFilePath}
          onRun={handleRunCode}
          isRunDisabled={isExecuting || !isRunnable}
        />
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0">
            <TabsBar
              tabs={openFiles}
              activeTabId={activeFileId}
              onTabSelect={handleTabSelect}
              onTabClose={handleCloseTab}
            />
            <div className="flex-1 relative overflow-hidden">
              <div
                className="absolute inset-0"
                style={{ bottom: isIoDrawerVisible ? `${drawerHeight}px` : '0px' }}
              >
                <Editor
                  key={activeFileId}
                  value={code}
                  language={language}
                  onChange={handleCodeChange}
                  onSelectionChange={handleSelectionChange}
                  onMouseUpWithSelection={handleMouseUpWithSelection}
                  onEditorMount={handleEditorMount}
                  isReadOnly={!activeFileId}
                />
              </div>
               {menuPosition && selectedText && (
                <FloatingMenu
                  ref={menuRef}
                  top={menuPosition.top}
                  left={menuPosition.left}
                  onExplain={handleExplain}
                />
              )}
              <IoDrawer
                isVisible={isIoDrawerVisible}
                isExecuting={isExecuting}
                output={executionOutput}
                error={executionError}
                html={executionHtml}
                onClose={() => setIsIoDrawerVisible(false)}
                onDebug={handleDebugError}
                onResizeStart={handleResizeStart}
                drawerHeight={drawerHeight}
              />
            </div>
            <StatusBar language={currentLanguageDetails.name} />
          </div>
          <AiPanel
            isVisible={isAiPanelVisible}
            isLoading={isLoading}
            conversation={aiConversation}
            error={error}
            onClose={() => setIsAiPanelVisible(false)}
            onAskFollowUp={handleAskFollowUp}
          />
        </div>
      </main>
      <CommandPalette 
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        commands={commands}
      />
    </div>
  );
};

export default App;