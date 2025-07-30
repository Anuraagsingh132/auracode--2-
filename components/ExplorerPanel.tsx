
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ContextMenu, ContextMenuItem } from './ContextMenu';
import type { FileSystemItem, FolderItem } from '../App';
import { SUPPORTED_LANGUAGES } from '../constants';

// --- ICONS ---
const FileTypeIcon: React.FC<{ name: string }> = ({ name }) => {
  let iconChar = '📄';
  let colorClass = 'text-aura-text-secondary';
  const extension = name.slice(name.lastIndexOf('.'));
  
  if (extension === '.js' || extension === '.jsx') {
    iconChar = 'JS'; colorClass = 'text-yellow-400';
  } else if (extension === '.ts' || extension === '.tsx') {
    iconChar = 'TS'; colorClass = 'text-blue-400';
  } else if (extension === '.py') {
    iconChar = 'PY'; colorClass = 'text-blue-400';
  } else if (extension === '.cpp' || extension === '.h') {
    iconChar = 'C++'; colorClass = 'text-sky-400';
  } else if (extension === '.java') {
    iconChar = 'J'; colorClass = 'text-red-400';
  } else if (extension === '.go') {
    iconChar = 'GO'; colorClass = 'text-cyan-400';
  } else if (extension === '.dart') {
    iconChar = 'D'; colorClass = 'text-teal-400';
  } else if (extension === '.kt') {
    iconChar = 'K'; colorClass = 'text-purple-400';
  } else if (extension === '.md') {
    iconChar = 'MD'; colorClass = 'text-gray-400';
  }
  
  return <span className={`w-6 flex-shrink-0 text-center text-xs font-bold ${colorClass}`}>{iconChar}</span>;
};

const ChevronIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
    <svg className={`w-4 h-4 text-aura-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
);

// --- HELPER HOOK for input validation ---
const useValidatedInput = (initialValue: string) => {
    const [value, setValue] = useState(initialValue);
    const [error, setError] = useState<string | null>(null);

    const validate = (name: string, parentChildren: FileSystemItem[], isCreating: boolean, originalName?: string): boolean => {
        const trimmed = name.trim();
        if (!trimmed) {
            setError("Name cannot be empty."); return false;
        }
        if (isCreating && parentChildren.some(c => c.name === trimmed)) {
            setError("An item with this name already exists."); return false;
        }
        if (!isCreating && trimmed !== originalName && parentChildren.some(c => c.name === trimmed)) {
            setError("An item with this name already exists."); return false;
        }
        if (name.includes('/')) {
            setError("Name cannot contain slashes."); return false;
        }
        setError(null);
        return true;
    };

    return { value, setValue, error, setError, validate };
};

// --- RENAME/CREATE INPUT ---
interface EditingInputProps {
    type: 'file' | 'folder';
    initialValue: string;
    onCommit: (name: string) => void;
    onCancel: () => void;
    validate: (name: string) => boolean;
    error: string | null;
}
const EditingInput: React.FC<EditingInputProps> = ({ type, initialValue, onCommit, onCancel, validate, error }) => {
    const [name, setName] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const handleCommit = () => {
        if (validate(name)) {
            onCommit(name.trim());
        }
    };
    
    return (
        <div className="flex flex-col py-1.5 pl-4">
            <div className="flex items-center">
                <div className="w-6 flex-shrink-0 text-center">{type === 'file' ? <FileTypeIcon name={name || '.txt'} /> : <ChevronIcon isOpen={true} />}</div>
                <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onBlur={handleCommit}
                    onKeyDown={e => {
                        if (e.key === 'Enter') handleCommit();
                        if (e.key === 'Escape') onCancel();
                    }}
                    className="ml-2 w-full bg-aura-bg text-aura-text-primary text-sm p-1 rounded-md focus:outline-none focus:ring-1 focus:ring-aura-accent border-none"
                    placeholder={type === 'file' ? 'filename.ext' : 'folder-name'}
                />
            </div>
            {error && <p className="text-red-400 text-xs mt-1 ml-8">{error}</p>}
        </div>
    );
};


// --- RECURSIVE FILE SYSTEM ENTRY ---
interface FileSystemEntryProps {
  item: FileSystemItem;
  level: number;
  activeFileId: string | null;
  openFolders: Set<string>;
  onToggleFolder: (folderId: string) => void;
  onFileSelect: (fileId: string) => void;
  onContextMenu: (e: React.MouseEvent, item: FileSystemItem) => void;
  setRenamingId: (id: string | null) => void;
  setCreatingInfo: (info: CreatingInfo | null) => void;
  onMoveItem: (itemId: string, newParentId: string | null) => void;
}

const FileSystemEntry: React.FC<FileSystemEntryProps> = ({ item, level, activeFileId, openFolders, onToggleFolder, onFileSelect, onContextMenu, onMoveItem }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const isOpen = item.type === 'folder' && openFolders.has(item.id);

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const draggedId = e.dataTransfer.getData('text/plain');
      const targetId = item.type === 'folder' ? item.id : null;
      if (draggedId && draggedId !== item.id) {
          onMoveItem(draggedId, targetId);
      }
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    };
    
    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
    };

    return (
        <li style={{ paddingLeft: `${level * 1.25}rem` }} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            <div
                draggable
                onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', item.id);
                    e.dataTransfer.effectAllowed = 'move';
                }}
                onClick={() => (item.type === 'folder' ? onToggleFolder(item.id) : onFileSelect(item.id))}
                onContextMenu={(e) => onContextMenu(e, item)}
                className={`flex items-center px-2 py-1.5 rounded-md w-full cursor-pointer transition-colors duration-150
                    ${activeFileId === item.id ? 'bg-aura-accent/20 text-aura-text-primary' : 'text-aura-text-secondary hover:bg-aura-panel'}
                    ${isDragOver && item.type === 'folder' ? 'outline outline-2 outline-aura-accent' : ''}
                `}
            >
                {item.type === 'folder' ? <ChevronIcon isOpen={isOpen} /> : <div className="w-4 h-4"></div>}
                <div className="ml-2 flex items-center truncate">
                    <FileTypeIcon name={item.name} />
                    <span className="ml-2 truncate" title={item.name}>{item.name}</span>
                </div>
            </div>
            {item.type === 'folder' && isOpen && (
                <ul>
                    {item.children.map(child => (
                        <FileSystemEntry
                            key={child.id}
                            item={child}
                            level={level + 1}
                            activeFileId={activeFileId}
                            openFolders={openFolders}
                            onToggleFolder={onToggleFolder}
                            onFileSelect={onFileSelect}
                            onContextMenu={onContextMenu}
                            setRenamingId={() => {}} // Pass down simplified props
                            setCreatingInfo={() => {}} // Pass down simplified props
                            onMoveItem={onMoveItem}
                        />
                    ))}
                </ul>
            )}
        </li>
    );
};

// --- MAIN EXPLORER PANEL ---
interface CreatingInfo { parentId: string | null; type: 'file' | 'folder' }

interface ExplorerPanelProps {
  isVisible: boolean;
  onClose: () => void;
  fileSystem: FileSystemItem[];
  activeFileId: string | null;
  onFileSelect: (filename: string) => void;
  onCreateItem: (parentId: string | null, type: 'file' | 'folder', name: string) => void;
  onRenameItem: (itemId: string, newName: string) => void;
  onDeleteItem: (itemId: string) => void;
  onMoveItem: (itemId: string, newParentId: string | null) => void;
}

export const ExplorerPanel: React.FC<ExplorerPanelProps> = ({ isVisible, onClose, fileSystem, activeFileId, onFileSelect, onCreateItem, onRenameItem, onDeleteItem, onMoveItem }) => {
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [creatingInfo, setCreatingInfo] = useState<CreatingInfo | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: FileSystemItem } | null>(null);
  const inputValidator = useValidatedInput('');

  const handleToggleFolder = (folderId: string) => {
    setOpenFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) newSet.delete(folderId);
      else newSet.add(folderId);
      return newSet;
    });
  };
  
  const handleContextMenu = (e: React.MouseEvent, item: FileSystemItem) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };
  
  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const getParentChildren = (targetItem: FileSystemItem): FileSystemItem[] => {
      let parent: FolderItem | undefined;
      const findParent = (current: FolderItem) => {
          if (current.children.some(c => c.id === targetItem.id)) {
              parent = current;
              return;
          }
          current.children.forEach(c => c.type === 'folder' && findParent(c));
      }
      fileSystem.forEach(item => item.type === 'folder' && findParent(item));
      return parent ? parent.children : fileSystem;
  }

  const contextMenuItems: ContextMenuItem[] = contextMenu ? [
    ...(contextMenu.item.type === 'folder' ? [
        { label: 'New File', onClick: () => { setCreatingInfo({ parentId: contextMenu.item.id, type: 'file' }); closeContextMenu(); }},
        { label: 'New Folder', onClick: () => { setCreatingInfo({ parentId: contextMenu.item.id, type: 'folder' }); closeContextMenu(); }},
    ] : []),
    { label: 'Rename', onClick: () => { setRenamingId(contextMenu.item.id); closeContextMenu(); }},
    { label: 'Delete', isDestructive: true, onClick: () => { onDeleteItem(contextMenu.item.id); closeContextMenu(); }},
  ] : [];

  const renderContent = (items: FileSystemItem[], level: number) => (
    <ul>
      {items.map(item => {
        const isRenaming = renamingId === item.id;
        const isCreatingInFolder = creatingInfo && item.type === 'folder' && openFolders.has(item.id) && creatingInfo.parentId === item.id;

        return (
          <React.Fragment key={item.id}>
            {isRenaming ? (
                <EditingInput
                    type={item.type}
                    initialValue={item.name}
                    onCommit={name => { onRenameItem(item.id, name); setRenamingId(null); }}
                    onCancel={() => setRenamingId(null)}
                    validate={name => inputValidator.validate(name, getParentChildren(item), false, item.name)}
                    error={inputValidator.error}
                />
            ) : (
                <FileSystemEntry 
                  item={item} 
                  level={level} 
                  activeFileId={activeFileId} 
                  openFolders={openFolders}
                  onFileSelect={onFileSelect} 
                  onToggleFolder={handleToggleFolder}
                  onContextMenu={handleContextMenu}
                  onMoveItem={onMoveItem}
                  setRenamingId={setRenamingId} // these are placeholders for recursive calls, not used
                  setCreatingInfo={setCreatingInfo} // these are placeholders for recursive calls, not used
                />
            )}
            {isCreatingInFolder && (
                 <li style={{ paddingLeft: `${(level + 1) * 1.25}rem` }}>
                    <EditingInput
                        type={creatingInfo.type}
                        initialValue=""
                        onCommit={name => { onCreateItem(creatingInfo.parentId, creatingInfo.type, name); setCreatingInfo(null); }}
                        onCancel={() => setCreatingInfo(null)}
                        validate={name => inputValidator.validate(name, item.children, true)}
                        error={inputValidator.error}
                    />
                </li>
            )}
          </React.Fragment>
        );
      })}
    </ul>
  );

  const handleRootDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId) {
        onMoveItem(draggedId, null);
    }
  };

  return (
    <aside
      className={`
        w-64 flex-shrink-0 bg-aura-surface border-r border-aura-border transition-all duration-300 ease-in-out flex flex-col
        ${isVisible ? 'ml-0' : '-ml-64'}
      `}
    >
      <header className="flex items-center justify-between p-4 border-b border-aura-border flex-shrink-0 h-14">
        <h2 className="text-sm font-medium uppercase tracking-widest text-aura-text-secondary">Explorer</h2>
        <div className="flex items-center gap-2">
            <button onClick={() => setCreatingInfo({ parentId: null, type: 'file' })} className="p-1 rounded-full text-aura-text-secondary hover:bg-aura-panel hover:text-aura-text-primary transition-colors" title="New File"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg></button>
            <button onClick={() => setCreatingInfo({ parentId: null, type: 'folder' })} className="p-1 rounded-full text-aura-text-secondary hover:bg-aura-panel hover:text-aura-text-primary transition-colors" title="New Folder"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z"></path><line x1="12" y1="10" x2="12" y2="16"></line><line x1="9" y1="13" x2="15" y2="13"></line></svg></button>
            <button onClick={onClose} className="p-1 rounded-full text-aura-text-secondary hover:bg-aura-panel hover:text-aura-text-primary transition-colors" aria-label="Close Explorer" ><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        </div>
      </header>
      <div className="flex-1 p-2 overflow-y-auto" onDragOver={e => e.preventDefault()} onDrop={handleRootDrop}>
        <div className="text-sm">
          {renderContent(fileSystem, 0)}
          {creatingInfo && creatingInfo.parentId === null && (
            <div className="pl-4">
                 <EditingInput
                    type={creatingInfo.type}
                    initialValue=""
                    onCommit={name => { onCreateItem(null, creatingInfo.type, name); setCreatingInfo(null); }}
                    onCancel={() => setCreatingInfo(null)}
                    validate={name => inputValidator.validate(name, fileSystem, true)}
                    error={inputValidator.error}
                />
            </div>
          )}
        </div>
      </div>
      {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} items={contextMenuItems} onClose={closeContextMenu} />}
    </aside>
  );
};