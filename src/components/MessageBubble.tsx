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
  const [showCopiedToast, setShowCopiedToast] = React.useState(false);
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsTouchDevice(window.matchMedia('(hover: none)').matches);
  }, []);

  const fallbackCopy = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  };

  const handleCopy = async (text: string, target: 'user' | 'assistant') => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const success = fallbackCopy(text);
        if (!success) throw new Error('Fallback copy failed');
      }
      setCopiedTarget(target);
      setShowCopiedToast(true);
      window.setTimeout(() => {
        setCopiedTarget((prev) => (prev === target ? null : prev));
      }, 1200);
      window.setTimeout(() => {
        setShowCopiedToast(false);
      }, 2000);
    } catch (error) {
      try {
        const success = fallbackCopy(text);
        if (success) {
          setCopiedTarget(target);
          setShowCopiedToast(true);
          window.setTimeout(() => {
            setCopiedTarget((prev) => (prev === target ? null : prev));
          }, 1200);
          window.setTimeout(() => {
            setShowCopiedToast(false);
          }, 2000);
          return;
        }
      } catch {
        // Ignore secondary fallback error, log primary copy issue below.
      }
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
              opacity: copiedTarget === 'user' || hoveredTarget === 'user' || isTouchDevice ? 1 : 0,
            }}
            aria-label="Copy user message"
            title="Copy"
            onTouchStart={() => setHoveredTarget('user')}
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
                opacity: copiedTarget === 'assistant' || hoveredTarget === 'assistant' || isTouchDevice ? 1 : 0,
              }}
              aria-label="Copy AI message"
              title="Copy"
              onTouchStart={() => setHoveredTarget('assistant')}
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
      {showCopiedToast && (
        <div
          style={{
            position: 'fixed',
            left: 'calc(260px + (100vw - 260px) / 2)',
            bottom: '88px',
            transform: 'translateX(-50%)',
            padding: '9px 15px',
            borderRadius: '999px',
            background:
              'linear-gradient(140deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.10) 45%, rgba(255,255,255,0.05) 100%)',
            border: '1px solid rgba(255,255,255,0.24)',
            backdropFilter: 'saturate(230%) blur(32px)',
            WebkitBackdropFilter: 'saturate(230%) blur(32px)',
            boxShadow:
              '0 8px 22px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.40), inset 0 -1px 0 rgba(255,255,255,0.08)',
            color: 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: 500,
            zIndex: 200,
            pointerEvents: 'none',
          }}
        >
          Message copied
        </div>
      )}
    </div>
  );
};
