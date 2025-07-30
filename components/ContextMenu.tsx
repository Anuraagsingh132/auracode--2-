
import React, { useEffect, useRef } from 'react';

export interface ContextMenuItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  isDestructive?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);
  
  // Adjust position if menu would go off-screen
  const menuStyle: React.CSSProperties = {
      top: `${y}px`,
      left: `${x}px`,
  };

  if (menuRef.current) {
      const { innerWidth, innerHeight } = window;
      const { offsetWidth, offsetHeight } = menuRef.current;
      if (x + offsetWidth > innerWidth) {
          menuStyle.left = `${x - offsetWidth}px`;
      }
      if (y + offsetHeight > innerHeight) {
          menuStyle.top = `${y - offsetHeight}px`;
      }
  }


  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-aura-panel border border-aura-border rounded-lg shadow-2xl w-40 animate-fade-in text-sm"
      style={menuStyle}
    >
      <ul className="p-1">
        {items.map((item, index) => (
          <li key={index}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
              }}
              disabled={item.disabled}
              className={`w-full text-left px-3 py-1.5 rounded-md flex items-center transition-colors duration-150
                ${item.isDestructive ? 'text-red-400 hover:bg-red-500/20' : 'text-aura-text-primary hover:bg-aura-accent hover:text-white'}
                ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
