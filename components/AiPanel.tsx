
import React, { useState, useEffect, useRef } from 'react';
import type { AiMessage } from '../App';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface AiPanelProps {
  isVisible: boolean;
  isLoading: boolean;
  conversation: AiMessage[];
  error: string | null;
  onClose: () => void;
  onAskFollowUp: (question: string) => void;
}

const LoadingSkeleton: React.FC = () => (
  <div className="p-6">
    <div className="space-y-4 animate-pulse-fast">
      <div className="h-4 bg-aura-border rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-aura-border rounded w-full"></div>
        <div className="h-3 bg-aura-border rounded w-5/6"></div>
        <div className="h-3 bg-aura-border rounded w-full"></div>
      </div>
      <div className="h-4 bg-aura-border rounded w-1/2"></div>
      <div className="space-y-2">
        <div className="h-3 bg-aura-border rounded w-full"></div>
        <div className="h-3 bg-aura-border rounded w-4/6"></div>
      </div>
    </div>
  </div>
);

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
    </svg>
);

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const CustomPre: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [isCopied, setIsCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = () => {
    if (preRef.current) {
      const codeText = preRef.current.innerText;
      navigator.clipboard.writeText(codeText).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  return (
    <div className="relative bg-aura-bg my-4 rounded-lg group">
      <button 
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md text-aura-text-secondary bg-aura-panel opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 hover:bg-aura-accent hover:text-white"
        aria-label="Copy code"
      >
        {isCopied ? <CheckIcon /> : <CopyIcon />}
      </button>
      <pre ref={preRef} className="p-4 text-sm overflow-x-auto">{children}</pre>
    </div>
  );
};

export const AiPanel: React.FC<AiPanelProps> = ({ isVisible, isLoading, conversation, error, onClose, onAskFollowUp }) => {
  const [followUp, setFollowUp] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (followUp.trim()) {
      onAskFollowUp(followUp);
      setFollowUp('');
    }
  };

  return (
    <div
      className={`
        flex-shrink-0 bg-aura-surface flex flex-col overflow-hidden transition-all duration-300 ease-in-out
        ${isVisible ? 'w-96 max-w-md border-l border-aura-border' : 'w-0'}
      `}
    >
      <header className="flex items-center justify-between p-4 border-b border-aura-border flex-shrink-0">
        <h2 className="text-lg font-medium text-aura-text-primary">AI Assistant</h2>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-aura-text-secondary hover:bg-aura-panel hover:text-aura-text-primary transition-colors"
          aria-label="Close AI Assistant"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </header>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {conversation.map((msg, index) => (
            <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-full rounded-xl px-4 py-3 ${msg.role === 'user' ? 'bg-aura-accent/20 text-aura-text-primary' : 'bg-aura-panel'}`}>
                {msg.role === 'model' ? (
                  <ReactMarkdown
                    className="prose prose-invert prose-sm max-w-none text-aura-text-secondary prose-p:leading-relaxed prose-headings:text-aura-text-primary prose-strong:text-aura-text-primary prose-code:text-aura-accent prose-code:bg-aura-surface/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-a:text-aura-accent hover:prose-a:text-aura-accent-hover prose-a:transition-colors"
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      pre: CustomPre,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && <LoadingSkeleton />}
          <div ref={messagesEndRef} />
        </div>
         {error && (
            <div className="p-6 pt-0">
                <div className="text-red-400 bg-red-900/50 p-4 rounded-lg border border-red-500/50 text-sm">
                    <h3 className="font-bold mb-1">Error</h3>
                    <p>{error}</p>
                </div>
            </div>
        )}
      </div>

      <div className="p-4 border-t border-aura-border bg-aura-surface">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="w-full bg-aura-panel text-sm text-aura-text-primary placeholder-aura-text-secondary px-4 py-2 rounded-lg border border-aura-border focus:outline-none focus:ring-2 focus:ring-aura-accent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !followUp.trim()}
            className="p-2 rounded-lg bg-aura-accent text-white disabled:bg-aura-border disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </form>
      </div>
    </div>
  );
};