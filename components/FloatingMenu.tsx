
import React, { forwardRef } from 'react';

interface FloatingMenuProps {
  top: number;
  left: number;
  onExplain: () => void;
}

export const FloatingMenu = forwardRef<HTMLDivElement, FloatingMenuProps>(({ top, left, onExplain }, ref) => {
  return (
    <div
      ref={ref}
      className="fixed z-40 bg-aura-surface border border-aura-border rounded-lg shadow-2xl p-1 flex items-center gap-1 animate-fade-in-up"
      style={{
        top: `${top}px`,
        left: `${left}px`,
        transform: 'translateX(-50%)', // Center the menu on the cursor
      }}
    >
      <button
        onClick={onExplain}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 text-aura-text-primary bg-aura-panel hover:bg-aura-accent hover:text-white"
        title="Explain Selection"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3c.3 0 .5.1.8.3l4.5 4.5c.2.2.3.5.3.8v7.8c0 .3-.1.5-.3.8l-4.5 4.5c-.2.2-.5.3-.8.3H7.8c-.3 0-.5-.1-.8-.3L2.5 16.2c-.2-.2-.3-.5-.3-.8V7.8c0-.3.1-.5.3-.8L7 3.3c.3-.2.5-.3.8-.3z"/><path d="M12 8v8"/><path d="m8.2 9.8 4.6 4.4"/><path d="m15.8 9.8-4.6 4.4"/></svg>
        Explain
      </button>
      <button
        disabled
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md text-aura-text-secondary cursor-not-allowed"
        title="Refactor (Coming Soon)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-7 18h14Z"/><path d="M10.5 13.5 12 9l1.5 4.5"/><path d="M8 18h8"/></svg>
        Refactor
      </button>
    </div>
  );
});