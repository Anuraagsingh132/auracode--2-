
import React from 'react';

// Simplified FileItem for props
interface TabItem {
  id: string;
  name: string;
}

interface TabsBarProps {
  tabs: TabItem[];
  activeTabId: string | null;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
}

export const TabsBar: React.FC<TabsBarProps> = ({ tabs, activeTabId, onTabSelect, onTabClose }) => {
  if (tabs.length === 0) {
    return null; // Don't render anything if there are no open tabs
  }

  return (
    <div className="flex-shrink-0 bg-aura-panel border-b border-aura-border">
      <div className="flex items-center" role="tablist">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            role="tab"
            aria-selected={tab.id === activeTabId}
            className={`flex items-center justify-between h-10 pl-4 pr-2 border-r border-aura-border cursor-pointer transition-colors duration-150 group max-w-[200px]
              ${
                tab.id === activeTabId
                  ? 'bg-aura-bg text-aura-text-primary'
                  : 'bg-aura-panel text-aura-text-secondary hover:bg-aura-surface hover:text-aura-text-primary'
              }
            `}
            onClick={() => onTabSelect(tab.id)}
          >
            <span className="text-sm font-medium truncate" title={tab.name}>
              {tab.name}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent tab selection when closing
                onTabClose(tab.id);
              }}
              className="ml-3 p-1 rounded-full flex-shrink-0 text-aura-text-secondary hover:bg-aura-accent/20 hover:text-aura-text-primary transition-colors opacity-50 group-hover:opacity-100 focus:opacity-100"
              aria-label={`Close ${tab.name}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
