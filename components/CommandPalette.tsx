
import React, { useState, useEffect, useRef } from 'react';

export interface Command {
  name: string;
  action: () => void;
  disabled?: boolean;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, commands }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredCommands = commands.filter(cmd => 
    cmd.name.toLowerCase().includes(query.toLowerCase()) && !cmd.name.startsWith('Create New')
  );

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery(''); // Reset query on open
    }
  }, [isOpen]);
  
  useEffect(() => {
    setActiveIndex(0); // Reset index when query changes
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => (i + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => (i - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const command = filteredCommands[activeIndex];
        if (command && !command.disabled) {
          command.action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, activeIndex, filteredCommands]);
  
  useEffect(() => {
    // Scroll active item into view
    if (listRef.current) {
        const activeItem = listRef.current.children[activeIndex] as HTMLElement;
        activeItem?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start pt-24" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-aura-panel rounded-xl shadow-2xl border border-aura-border overflow-hidden transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-aura-text-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="w-full bg-aura-panel text-lg text-aura-text-primary placeholder-aura-text-secondary p-4 pl-12 focus:outline-none"
            />
        </div>
        <div ref={listRef} className="border-t border-aura-border max-h-96 overflow-y-auto">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, index) => (
              <div
                key={cmd.name}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (!cmd.disabled) {
                    cmd.action();
                    onClose();
                  }
                }}
                className={`p-4 flex justify-between items-center cursor-pointer text-sm ${
                  activeIndex === index ? 'bg-aura-accent text-white' : 'text-aura-text-secondary'
                } ${
                  cmd.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-aura-accent/80 hover:text-white'
                }`}
              >
                <span>{cmd.name}</span>
                {cmd.disabled && <span className="text-xs">Unavailable</span>}
              </div>
            ))
          ) : (
            <p className="p-4 text-sm text-aura-text-secondary">No results found.</p>
          )}
        </div>
      </div>
    </div>
  );
};
