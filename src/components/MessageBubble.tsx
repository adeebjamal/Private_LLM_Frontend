import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Message } from '../api';
import { User, Bot, Copy, Check } from 'lucide-react';

interface Props {
  message: Message;
}

export const MessageBubble: React.FC<Props> = ({ message }) => {
  const [copiedTarget, setCopiedTarget] = React.useState<'user' | 'assistant' | null>(null);
  const [hoveredTarget, setHoveredTarget] = React.useState<'user' | 'assistant' | null>(null);

  const handleCopy = async (text: string, target: 'user' | 'assistant') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTarget(target);
      window.setTimeout(() => {
        setCopiedTarget((prev) => (prev === target ? null : prev));
      }, 1200);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const copyButtonStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    borderRadius: '6px',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background-color 0.12s ease',
    position: 'absolute',
    top: '6px',
    right: '6px',
    opacity: 0,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
      {/* User Query */}
      <div className="msg-user" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: '8px' }}>
        <div
          style={{
            maxWidth: '75%',
            padding: '10px 34px 10px 14px',
            background: 'var(--bubble-user-bg)',
            color: 'var(--bubble-user-text)',
            borderRadius: '18px 18px 4px 18px',
            fontSize: '0.93rem',
            lineHeight: 1.45,
            position: 'relative',
          }}
          onMouseEnter={() => setHoveredTarget('user')}
          onMouseLeave={() => setHoveredTarget((prev) => (prev === 'user' ? null : prev))}
        >
          <button
            type="button"
            onClick={() => handleCopy(message.user_query, 'user')}
            style={{
              ...copyButtonStyle,
              opacity: copiedTarget === 'user' || hoveredTarget === 'user' ? 1 : 0,
            }}
            aria-label="Copy user message"
            title="Copy"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--sidebar-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {copiedTarget === 'user' ? <Check size={12} strokeWidth={2.3} /> : <Copy size={12} strokeWidth={2.1} />}
          </button>
          {message.user_query}
        </div>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          <User size={14} strokeWidth={2.2} />
        </div>
      </div>

      {/* AI Response */}
      {message.response && (
        <div className="msg-ai" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--bubble-ai-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              flexShrink: 0,
            }}
          >
            <Bot size={14} strokeWidth={2.2} />
          </div>
          <div
            className="markdown-body"
            style={{
              maxWidth: '75%',
              padding: '10px 34px 10px 14px',
              background: 'var(--bubble-ai-bg)',
              color: 'var(--bubble-ai-text)',
              borderRadius: '18px 18px 18px 4px',
              fontSize: '0.93rem',
              lineHeight: 1.45,
              position: 'relative',
            }}
            onMouseEnter={() => setHoveredTarget('assistant')}
            onMouseLeave={() => setHoveredTarget((prev) => (prev === 'assistant' ? null : prev))}
          >
            <button
              type="button"
              onClick={() => handleCopy(message.response, 'assistant')}
              style={{
                ...copyButtonStyle,
                opacity: copiedTarget === 'assistant' || hoveredTarget === 'assistant' ? 1 : 0,
              }}
              aria-label="Copy AI message"
              title="Copy"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--sidebar-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {copiedTarget === 'assistant' ? <Check size={12} strokeWidth={2.3} /> : <Copy size={12} strokeWidth={2.1} />}
            </button>
            <ReactMarkdown>{message.response}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};
