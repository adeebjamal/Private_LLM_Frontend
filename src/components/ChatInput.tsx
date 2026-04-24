import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Globe } from 'lucide-react';

interface Props {
  onSendMessage: (query: string, useInternet: boolean) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<Props> = ({ onSendMessage, isLoading }) => {
  const [query, setQuery] = useState('');
  const [useInternet, setUseInternet] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSendMessage(query.trim(), useInternet);
      setQuery('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSend = query.trim() && !isLoading;

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: '12px 16px 16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px',
          padding: '8px 12px 8px 16px',
          background: 'var(--input-bg)',
          border: '0.5px solid var(--input-border)',
          borderRadius: '22px',
          boxShadow: 'var(--shadow-sm)',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message"
          disabled={isLoading}
          rows={1}
          style={{
            flex: 1,
            padding: '6px 0',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-primary)',
            fontSize: '0.93rem',
            lineHeight: 1.45,
            resize: 'none',
            outline: 'none',
            overflowY: 'auto',
            maxHeight: '140px',
          }}
        />
        <button
          type="button"
          onClick={() => setUseInternet((prev) => !prev)}
          aria-pressed={useInternet}
          aria-label={`Web search ${useInternet ? 'enabled' : 'disabled'}`}
          title="Allow internet search for this message"
          disabled={isLoading}
          style={{
            border: 'none',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0 2px',
            marginBottom: '7px',
            cursor: isLoading ? 'default' : 'pointer',
            color: useInternet ? 'var(--accent)' : 'var(--text-secondary)',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          <Globe size={14} strokeWidth={2.2} />
          <span
            style={{
              fontSize: '0.76rem',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              userSelect: 'none',
            }}
          >
            Web
          </span>
          <span
            style={{
              width: '30px',
              height: '18px',
              borderRadius: '999px',
              background: useInternet ? 'var(--accent)' : 'var(--separator)',
              position: 'relative',
              transition: 'background 0.15s ease',
              boxShadow: 'inset 0 0 0 0.5px var(--input-border)',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '2px',
                left: useInternet ? '14px' : '2px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.15s ease',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.18)',
              }}
            />
          </span>
        </button>
        <button
          className="send-btn"
          type="submit"
          disabled={!canSend}
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: canSend ? 'var(--accent)' : 'var(--separator)',
            border: 'none',
            color: canSend ? '#fff' : 'var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canSend ? 'pointer' : 'default',
            transition: 'background 0.15s ease',
            flexShrink: 0,
            marginBottom: '2px',
          }}
        >
          <ArrowUp size={16} strokeWidth={2.5} />
        </button>
      </div>
    </form>
  );
};
