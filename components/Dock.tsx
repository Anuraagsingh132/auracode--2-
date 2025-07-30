import React from 'react';
import clsx from 'clsx'; // A tiny utility for constructing className strings conditionally

// --- Reusable SVG Icon Components ---

const ExplorerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
    </svg>
);

const AiIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
);

const CollaborationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.12l-.15.1a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1 0-2.12l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const FullscreenEnterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
);

const FullscreenExitIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 0-2-2H3m18 0h-3a2 2 0 0 0-2 2v3" />
    </svg>
);


// --- Refactored DockIcon Component ---

interface IconProps {
    children: React.ReactNode;
    tooltip: string;
    isActive?: boolean;
    onClick?: () => void;
    disabled?: boolean;
}

const DockIcon: React.FC<IconProps> = ({ children, tooltip, isActive = false, onClick, disabled = false }) => (
    <div className="group relative flex items-center">
        {/* Active State Pip */}
        <div className={clsx('absolute left-0 h-5 w-1 rounded-r-full bg-white transition-all duration-300',
            { 'opacity-100 translate-x-0': isActive, 'opacity-0 -translate-x-2': !isActive }
        )} />

        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={tooltip} // Important for accessibility
            className={clsx(
                'p-3 rounded-xl transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-aura-surface focus:ring-aura-accent',
                {
                    'bg-aura-accent text-white': isActive,
                    'text-aura-text-secondary hover:bg-aura-accent/15 hover:text-aura-accent': !isActive && !disabled,
                    'opacity-50 cursor-not-allowed': disabled,
                    'group-hover:scale-110 active:scale-95': !disabled,
                }
            )}
        >
            {children}
        </button>

        <span className="absolute left-full ml-4 w-auto min-w-max origin-left transform rounded-md bg-aura-surface px-3 py-2 text-xs font-medium text-aura-text-primary shadow-lg transition-all duration-200 ease-in-out opacity-0 group-hover:opacity-100 group-hover:delay-300 -translate-x-2 group-hover:translate-x-0">
            {tooltip}
        </span>
    </div>
);


// --- Data-Driven Dock Component ---

interface DockProps {
    isExplorerVisible: boolean;
    onToggleExplorer: () => void;
    isAiPanelVisible: boolean;
    onToggleAiPanel: () => void;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
}

// Defines the shape of an icon's configuration object
type IconConfig = Omit<IconProps, 'children'> & {
    id: string;
    icon: React.ReactNode;
};

export const Dock: React.FC<DockProps> = ({ isExplorerVisible, onToggleExplorer, isAiPanelVisible, onToggleAiPanel, isFullscreen, onToggleFullscreen }) => {

    const topItems: IconConfig[] = [
        { id: 'explorer', tooltip: 'Explorer', icon: <ExplorerIcon />, isActive: isExplorerVisible, onClick: onToggleExplorer },
        { id: 'ai', tooltip: 'AI Assistant', icon: <AiIcon />, isActive: isAiPanelVisible, onClick: onToggleAiPanel },
        { id: 'collab', tooltip: 'Collaboration (soon)', icon: <CollaborationIcon />, disabled: true },
    ];

    const bottomItems: IconConfig[] = [
        {
            id: 'fullscreen',
            tooltip: isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen',
            icon: isFullscreen ? <FullscreenExitIcon /> : <FullscreenEnterIcon />,
            onClick: onToggleFullscreen,
        },
        { id: 'settings', tooltip: 'Settings (soon)', icon: <SettingsIcon />, disabled: true },
    ];

    return (
        <aside className="bg-aura-surface/50 border-r border-aura-border h-screen w-20 flex flex-col items-center justify-between py-6 z-30">
            <div className="flex flex-col items-center gap-4">
                {/* Logo placeholder */}
                <div className="w-10 h-10 bg-gradient-to-br from-aura-accent to-purple-400 rounded-full mb-4 shadow-lg cursor-pointer transition-transform hover:scale-110 active:scale-95"></div>

                {topItems.map(item => (
                    <DockIcon key={item.id} {...item}>
                        {item.icon}
                    </DockIcon>
                ))}
            </div>

            <div className="flex flex-col items-center gap-4">
                <hr className="w-8 border-t border-aura-border/40" />
                {bottomItems.map(item => (
                    <DockIcon key={item.id} {...item}>
                        {item.icon}
                    </DockIcon>
                ))}
            </div>
        </aside>
    );
};