
import React from 'react';

interface HeaderProps {
  filename: string;
  filePath: string;
  onRun: () => void;
  isRunDisabled: boolean;
}

export const AppHeader: React.FC<HeaderProps> = ({ filename, filePath, onRun, isRunDisabled }) => {
  return (
    <header className="flex items-center justify-between h-14 px-6 border-b border-aura-border flex-shrink-0 bg-aura-surface/50">
      <div>
        <h1 className="text-lg font-medium text-aura-text-primary">{filename}</h1>
        <p className="text-xs text-aura-text-secondary truncate max-w-xs md:max-w-md lg:max-w-lg" title={filePath}>{filePath}</p>
      </div>
      <div className="flex items-center gap-4">
        {/* Placeholder for Collab Avatars */}
        <div className="flex -space-x-2">
          <img className="inline-block h-8 w-8 rounded-full ring-2 ring-aura-bg" src="https://picsum.photos/seed/user1/40/40" alt="User 1" />
          <img className="inline-block h-8 w-8 rounded-full ring-2 ring-aura-bg" src="https://picsum.photos/seed/user2/40/40" alt="User 2" />
        </div>
        
        <button
          onClick={onRun}
          disabled={isRunDisabled}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-green-500/90 text-white shadow-lg shadow-green-500/20 hover:bg-green-500 disabled:bg-aura-surface disabled:text-aura-text-secondary disabled:cursor-not-allowed disabled:shadow-none"
          aria-label={isRunDisabled ? "Executing code" : "Run code (Ctrl+Enter)"}
        >
          {isRunDisabled ? (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          )}
          {isRunDisabled ? 'Running...' : 'Run'}
        </button>
      </div>
    </header>
  );
};
