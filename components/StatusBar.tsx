import React from 'react';

interface StatusBarProps {
  language: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({ language }) => {
  return (
    <footer className="h-8 px-4 flex items-center justify-between text-xs bg-aura-surface border-t border-aura-border flex-shrink-0 relative">
      <div className="flex items-center gap-4 text-aura-text-secondary">
         <div className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          <span>{language}</span>
        </div>
        <span>UTF-8</span>
        <span>2 Spaces</span>
      </div>
      <div className="flex items-center gap-4 text-aura-text-secondary">
        <span>Ln 1, Col 1</span>
        <button className="hover:text-aura-text-primary transition-colors">
          Zen Mode
        </button>
      </div>
    </footer>
  );
};
